import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('authToken');

  // Lista de URLs que no requieren autenticación
  const publicUrls = [
    '/auth/login',
    '/auth/register',
    '/auth/reset-password',
    '/auth/refresh-token'
  ];

  // Verificar si la URL es pública
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));

  // Clonar la request y agregar headers
  let clonedRequest = req.clone({
    withCredentials: true // Habilitar cookies para refresh token
  });

  // Solo agregar el token si existe y no es una URL pública
  if (token && !isPublicUrl) {
    clonedRequest = clonedRequest.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Manejar la request y capturar errores
  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si es 401 Unauthorized, limpiar sesión y redirigir
      if (error.status === 401) {
        const currentUrl = router.url;

        // Solo limpiar y redirigir si no estamos en páginas públicas
        if (!currentUrl.includes('/login') && !currentUrl.includes('/register') && !currentUrl.includes('/reset-password')) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('tenantName');
          localStorage.removeItem('username');

          router.navigate(['/login'], {
            queryParams: {
              sessionExpired: 'true',
              returnUrl: currentUrl
            }
          });
        }
      }

      // Si es 403 Forbidden
      if (error.status === 403) {
        console.error('Acceso prohibido:', error.error?.message || 'No tienes permisos para realizar esta acción');
      }

      // Si es error de conexión
      if (error.status === 0) {
        console.error('Error de conexión: No se pudo conectar al servidor');
      }

      return throwError(() => error);
    })
  );
};
