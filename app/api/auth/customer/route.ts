import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, generateToken, verifyToken, getTokenFromHeader } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { action, email, password, firstName, lastName, phone } = await req.json();

    if (action === "register") {
      if (!email || !password || !firstName || !lastName) {
        return NextResponse.json(
          { error: "Prénom, nom, email et mot de passe sont requis" },
          { status: 400 }
        );
      }

      const existing = await prisma.customer.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: "Cet email est déjà utilisé" },
          { status: 409 }
        );
      }

      const hashedPassword = await hashPassword(password);
      const customer = await prisma.customer.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone: phone || null,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      });

      const token = generateToken({
        userId: customer.id,
        email: customer.email,
        role: "customer",
      });

      return NextResponse.json({ token, customer }, { status: 201 });
    }

    if (action === "login") {
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email et mot de passe sont requis" },
          { status: 400 }
        );
      }

      const customer = await prisma.customer.findUnique({ where: { email } });
      if (!customer || !customer.password || !customer.active) {
        return NextResponse.json(
          { error: "Identifiants invalides" },
          { status: 401 }
        );
      }

      const valid = await verifyPassword(password, customer.password);
      if (!valid) {
        return NextResponse.json(
          { error: "Identifiants invalides" },
          { status: 401 }
        );
      }

      const token = generateToken({
        userId: customer.id,
        email: customer.email,
        role: "customer",
      });

      return NextResponse.json({
        token,
        customer: {
          id: customer.id,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
        },
      });
    }

    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// GET: Récupérer le profil du client connecté
export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (decoded.role !== "customer") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        dateOfBirth: true,
        gender: true,
        idType: true,
        idNumber: true,
        idImageFront: true,
        idImageBack: true,
        orders: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ customer });
  } catch {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }
}

// PUT: Mettre à jour le profil du client
export async function PUT(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (decoded.role !== "customer") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { firstName, lastName, phone, address, city, dateOfBirth, gender, idType, idNumber, idImageFront, idImageBack } = await req.json();

    const customer = await prisma.customer.update({
      where: { id: decoded.userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
        ...(gender !== undefined && { gender }),
        ...(idType !== undefined && { idType }),
        ...(idNumber !== undefined && { idNumber }),
        ...(idImageFront !== undefined && { idImageFront }),
        ...(idImageBack !== undefined && { idImageBack }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        dateOfBirth: true,
        gender: true,
        idType: true,
        idNumber: true,
        idImageFront: true,
        idImageBack: true,
      },
    });

    return NextResponse.json({ customer });
  } catch {
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
