import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Récupérer le token depuis le localStorage
  const token = localStorage.getItem('accessToken');
  
  if (token) {
    // Cloner la requête et ajouter le header Authorization
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }
  
  // Si pas de token, continuer avec la requête originale
  return next(req);
};
