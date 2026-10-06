import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { WishModel } from "@/models/Wish";
import { isAdminRequest } from "@/lib/adminAuth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (typeof body?.flagged !== "boolean") {
    return NextResponse.json({ error: "flagged must be a boolean." }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const updated = await WishModel.findByIdAndUpdate(
      id,
      { flagged: body.flagged },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Wish not found." }, { status: 404 });
    }

    return NextResponse.json({
      id: updated._id.toString(),
      name: updated.name,
      wish: updated.wish,
      flagged: updated.flagged,
      createdAt: updated.createdAt,
    });
  } catch (error) {
    console.error("Failed to update wish:", error);
    return NextResponse.json({ error: "Could not update wish." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectToDatabase();
    const deleted = await WishModel.findByIdAndDelete(id).lean();

    if (!deleted) {
      return NextResponse.json({ error: "Wish not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete wish:", error);
    return NextResponse.json({ error: "Could not delete wish." }, { status: 500 });
  }
}
