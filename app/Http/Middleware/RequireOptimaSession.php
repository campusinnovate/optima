<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireOptimaSession
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->session()->has('optima_user')) {
            return redirect()->route('login')->with('error', 'Silakan masuk untuk melanjutkan.');
        }

        return $next($request);
    }
}
