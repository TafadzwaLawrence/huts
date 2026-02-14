import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch notifications for the user
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    // Get unread count
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('read_at', null)

    return NextResponse.json({ 
      notifications: notifications || [], 
      unreadCount: count || 0 
    })
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationId, markAllRead } = await request.json()

    if (markAllRead) {
      // Mark all notifications as read
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null)

      if (error) throw error
    } else if (notificationId) {
      // Mark single notification as read
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')
    const deleteAll = searchParams.get('all') === 'true'

    if (deleteAll) {
      // Delete all notifications for user
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
    } else if (notificationId) {
      // Delete single notification
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting notification:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
