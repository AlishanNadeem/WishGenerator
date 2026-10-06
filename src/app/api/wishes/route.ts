import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { WishModel } from "@/models/Wish";
import { isAdminRequest } from "@/lib/adminAuth";
import { MAX_NAME_LENGTH, MAX_WISH_LENGTH } from "@/types/wish";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const wish = typeof body?.wish === "string" ? body.wish.trim() : "";

  if (!name || !wish) {
    return NextResponse.json({ error: "Name and wish are both required." }, { status: 400 });
  }

  if (name.length > MAX_NAME_LENGTH) {
    return NextResponse.json(
      { error: `Name must be ${MAX_NAME_LENGTH} characters or fewer.` },
      { status: 400 }
    );
  }

  if (wish.length > MAX_WISH_LENGTH) {
    return NextResponse.json(
      { error: `Wish must be ${MAX_WISH_LENGTH} characters or fewer.` },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    const created = await WishModel.create({ name, wish });

    return NextResponse.json(
      {
        id: created._id.toString(),
        name: created.name,
        wish: created.wish,
        flagged: created.flagged,
        createdAt: created.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to save wish:", error);
    return NextResponse.json({ error: "Could not save your wish. Please try again." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    parsePositiveInt(searchParams.get("limit"), DEFAULT_PAGE_SIZE)
  );
  const search = (searchParams.get("search") ?? "").trim();

  const filter = search ? { name: { $regex: escapeRegExp(search), $options: "i" } } : {};

  try {
    await connectToDatabase();

    const [wishes, total] = await Promise.all([
      WishModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      WishModel.countDocuments(filter),
    ]);

    return NextResponse.json({
      wishes: wishes.map((wishDoc) => ({
        id: wishDoc._id.toString(),
        name: wishDoc.name,
        wish: wishDoc.wish,
        flagged: wishDoc.flagged,
        createdAt: wishDoc.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    console.error("Failed to load wishes:", error);
    return NextResponse.json({ error: "Could not load wishes." }, { status: 500 });
  }
}
