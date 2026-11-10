import { NextResponse } from 'next/server'
import { Pokemon } from '@/db/sequelize'
import { ValidationError, UniqueConstraintError } from 'sequelize'

import jwt from 'jsonwebtoken'
import privateKey from '@/auth/private_key'

function verifierLaCle(request) {
  // 1. On regarde si la personne a apporté sa clé
  const auth = request.headers.get('authorization')

  if (!auth) {
    return null // Pas de clé
  }

  // 2. La clé ressemble à : "Bearer abc123..."
  // On enlève le mot "Bearer " pour garder juste "abc123..."
  const token = auth.split(' ')[1]

  try {
    // 3. On vérifie si la clé est vraie
    const decoded = jwt.verify(token, privateKey)
    return decoded // Clé bonne, on laisse passer
  } catch (error) {
    return null // Clé fausse ou expirée
  }
}

export async function POST(request) {
  try {
    // --- LA SERRURE ---
    const user = verifierLaCle(request)

    if (!user) {
      return NextResponse.json(
        { message: `Tu dois être connecté pour créer un Pokémon.` },
        { status: 401 }
      )
    }
    // --- FIN DE LA SERRURE ---

    const message = `Le pokémon ${body.name} a bien été créé.`
    return NextResponse.json({ message, data: pokemon }, { status: 201 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: error.message, data: error }, { status: 400 })
    }
    if (error instanceof UniqueConstraintError) {
      return NextResponse.json({ message: error.message, data: error }, { status: 400 })
    }

    const message = `Le pokémon n'a pas pu être ajouté. Réessayez dans quelques instants.`
    return NextResponse.json({ message, data: error.message }, { status: 500 })
  }
}