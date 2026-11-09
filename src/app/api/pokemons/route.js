import { NextResponse } from 'next/server'
import { Pokemon } from '@/db/sequelize'
import { ValidationError, UniqueConstraintError } from 'sequelize'

export async function POST(request) {
  try {
    const body = await request.json()
    const pokemon = await Pokemon.create(body)

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