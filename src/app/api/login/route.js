import { NextResponse } from 'next/server'
import { User } from '@/db/sequelize'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import privateKey from '@/auth/private_key' // Assure-toi que le chemin d'import correspond à ton projet

export async function POST(request) {
  try {
    const body = await request.json()

    const user = await User.findOne({ where: { username: body.username } })

    if (!user) {
      const message = `L'utilisateur demandé n'existe pas.`
      return NextResponse.json({ message }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password)

    if (!isPasswordValid) {
      const message = `Le mot de passe est incorrect.`
      return NextResponse.json({ message }, { status: 401 })
    }

    // Générer un jeton JWT valide pendant 24 heures.
    const token = jwt.sign(
      { userId: user.id },
      privateKey,
      { expiresIn: '24h' }
    )

    const message = `L'utilisateur a été connecté avec succès`
    return NextResponse.json({ message, data: user, token })

  } catch (error) {
    const message = `L'utilisateur n'a pas pu être connecté. Réessayez dans quelques instants.`
    return NextResponse.json({ message, data: error.message }, { status: 500 })
  }
}