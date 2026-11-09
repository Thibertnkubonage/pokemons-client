import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function proxy(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1] || 
                request.cookies.get('token')?.value

  // 1. Pas de token -> on bloque
  if (!token) {
    return NextResponse.json(
      { message: "Vous n'avez pas fourni de jeton" },
      { status: 401 }
    )
  }

  try {
    // 2. Vérifie le token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'TA_CLE_SECRETE_OU_PRIVEE'
    )
    
    await jwtVerify(token, secret)

    // 3. Token OK -> on laisse passer
    return NextResponse.next()

  } catch (error) {
    // Token invalide ou expiré
    return NextResponse.json(
      { message: "Jeton invalide ou expiré" },
      { status: 401 }
    )
  }
}

// 4. Où doit s'appliquer le proxy
export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    // Ajoute ici les routes à protéger
    // Ex: '/pokemons/:path*'
  ],
}