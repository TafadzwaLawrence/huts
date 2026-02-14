import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, bio, role, avatar_url } = body

    if (role && !["landlord", "renter"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const updateData: Record<string, any> = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (bio !== undefined) updateData.bio = bio
    if (role !== undefined) updateData.role = role
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Profile update error:", error)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({ profile: data })
  } catch (error) {
    console.error("Profile API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
