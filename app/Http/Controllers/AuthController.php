<?php

namespace App\Http\Controllers;

use App\Models\UserProfile;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\View\View;

class AuthController extends Controller
{
    public function showLogin(): View
    {
        return view('auth.login');
    }

    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        try {
            $response = $this->client()->post('/auth/v1/token?grant_type=password', $credentials);
        } catch (ConnectionException) {
            return back()->withInput($request->only('email'))->withErrors(['email' => 'Layanan autentikasi tidak dapat dihubungi.']);
        }

        if ($response->failed()) {
            return back()->withInput($request->only('email'))->withErrors(['email' => 'Email atau password tidak valid.']);
        }

        return $this->establishSession($request, $response->json());
    }

    public function google(): RedirectResponse
    {
        $redirect = route('auth.callback');
        $url = rtrim((string) config('services.supabase.url'), '/')
            .'/auth/v1/authorize?provider=google&redirect_to='.urlencode($redirect);

        return redirect()->away($url);
    }

    public function callback(): View
    {
        return view('auth.callback');
    }

    public function storeSession(Request $request): RedirectResponse
    {
        $payload = $request->validate([
            'access_token' => ['required', 'string'],
            'refresh_token' => ['nullable', 'string'],
            'expires_in' => ['nullable', 'integer'],
        ]);

        $userResponse = $this->client($payload['access_token'])->get('/auth/v1/user');

        if ($userResponse->failed()) {
            return redirect()->route('login')->withErrors(['email' => 'Sesi Google tidak dapat diverifikasi.']);
        }

        return $this->establishSession($request, [...$payload, 'user' => $userResponse->json()]);
    }

    public function logout(Request $request): RedirectResponse
    {
        $token = data_get($request->session()->get('optima_user'), 'access_token');
        if ($token) {
            $this->client($token)->post('/auth/v1/logout');
        }

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('status', 'Anda telah keluar.');
    }

    private function establishSession(Request $request, array $auth): RedirectResponse
    {
        $authUser = $auth['user'] ?? [];
        $profile = UserProfile::query()->firstOrCreate(
            ['auth_user_id' => $authUser['id']],
            [
                'name' => data_get($authUser, 'user_metadata.full_name', strtok((string) ($authUser['email'] ?? 'Pengguna'), '@')),
                'email' => $authUser['email'] ?? null,
                'role' => 'crm_staff',
                'is_active' => true,
            ]
        );

        if (! $profile->is_active) {
            return redirect()->route('login')->withErrors(['email' => 'Akun Anda belum aktif. Hubungi administrator.']);
        }

        $request->session()->regenerate();
        $request->session()->put('optima_user', [
            'id' => $profile->id,
            'auth_user_id' => $profile->auth_user_id,
            'name' => $profile->name,
            'email' => $profile->email,
            'role' => $profile->role,
            'access_token' => $auth['access_token'] ?? null,
            'refresh_token' => $auth['refresh_token'] ?? null,
        ]);

        return redirect()->intended(route('dashboard'));
    }

    private function client(?string $bearer = null)
    {
        $client = Http::baseUrl(rtrim((string) config('services.supabase.url'), '/'))
            ->acceptJson()
            ->withHeader('apikey', (string) config('services.supabase.publishable_key'));

        return $bearer ? $client->withToken($bearer) : $client;
    }
}
