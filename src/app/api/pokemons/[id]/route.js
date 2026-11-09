import { NextResponse } from 'next/server'
import { Pokemon } from '@/db/sequelize'
import { ValidationError, UniqueConstraintError } from 'sequelize'

// --- ROUTE GET : Récupérer un pokémon par son ID ---
export async function GET(request, { params }) {
  try {
    const { id } = await params

    const pokemon = await Pokemon.findByPk(id)

    if (pokemon === null) {
      const message = `Le pokémon demandé n'existe pas. Réessayez avec un autre identifiant.`
      return NextResponse.json({ message }, { status: 404 })
    }

    const message = 'Un pokémon a bien été trouvé.'
    return NextResponse.json({ message, data: pokemon })
  } catch (error) {
    const message = `Le pokémon n'a pas pu être récupéré. Réessayez dans quelques instants.`
    return NextResponse.json({ message, data: error.message }, { status: 500 })
  }
}

// --- ROUTE PUT : Modifier un pokémon par son ID ---
export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()

    const rowsUpdated = await Pokemon.update(body, {
      where: { id: id }
    })

    if (rowsUpdated[0] === 0) {
      const message = `Le pokémon demandé n'existe pas. Réessayez avec un autre identifiant.`
      return NextResponse.json({ message }, { status: 404 })
    }

    const pokemon = await Pokemon.findByPk(id)

    if (pokemon === null) {
      const message = `Le pokémon demandé n'existe pas. Réessayez avec un autre identifiant.`
      return NextResponse.json({ message }, { status: 404 })
    }

    const message = `Le pokémon ${pokemon.name} a bien été modifié.`
    return NextResponse.json({ message, data: pokemon })

  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: error.message, data: error }, { status: 400 })
    }
    if (error instanceof UniqueConstraintError) {
      return NextResponse.json({ message: error.message, data: error }, { status: 400 })
    }

    const message = `Le pokémon n'a pas pu être modifié. Réessayez dans quelques instants.`
    return NextResponse.json({ message, data: error.message }, { status: 500 })
  }
}

// --- ROUTE DELETE : Supprimer un pokémon par son ID ---
export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const pokemon = await Pokemon.findByPk(id)

    if (pokemon === null) {
      const message = `Le pokémon demandé n'existe pas. Réessayez avec un autre identifiant.`
      return NextResponse.json({ message }, { status: 404 })
    }

    await Pokemon.destroy({ where: { id: pokemon.id } })

    const message = `Le pokémon avec l'identifiant n°${pokemon.id} a bien été supprimé.`
    return NextResponse.json({ message, data: pokemon })

  } catch (error) {
    const message = `Le pokémon n'a pas pu être supprimé. Réessayez dans quelques instants.`
    return NextResponse.json({ message, data: error.message }, { status: 500 })
  }
}