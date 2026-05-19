import { supabase } from './supabase'

async function uid() {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

export async function getStudent() {
  const id = await uid()
  if (!id) return null
  const { data } = await supabase.from('students').select('*').eq('id', id).single()
  return data
}

export async function updateStudent(fields) {
  const id = await uid()
  if (!id) return false
  const { error } = await supabase.from('students').update(fields).eq('id', id)
  return !error
}

export async function getEnrolledCourses() {
  const id = await uid()
  if (!id) return []
  const { data } = await supabase
    .from('enrollments')
    .select('conflict, semester, status, courses(*)')
    .eq('student_id', id)
  return (data ?? []).map(e => ({
    ...e.courses,
    start: e.courses.start_hour,
    end: e.courses.end_hour,
    conflict: e.conflict,
    semester: e.semester ?? 'y1s1',
    status: e.status ?? 'planned',
  }))
}

export async function addEnrollment(courseCode, conflict = false, semester = 'y1s1') {
  const id = await uid()
  if (!id) throw new Error('לא מחובר')
  const { error } = await supabase
    .from('enrollments')
    .insert({ student_id: id, course_code: courseCode, conflict, semester, status: 'planned' })
  if (error) throw error
  return true
}

export async function updateEnrollment(courseCode, fields) {
  const id = await uid()
  if (!id) return false
  const { error } = await supabase
    .from('enrollments')
    .update(fields)
    .eq('student_id', id)
    .eq('course_code', courseCode)
  return !error
}

export async function removeEnrollment(courseCode) {
  const id = await uid()
  if (!id) return false
  const { error } = await supabase
    .from('enrollments')
    .delete()
    .eq('student_id', id)
    .eq('course_code', courseCode)
  return !error
}

export async function upsertCourse(course) {
  const { error } = await supabase.from('courses').upsert({
    code: course.code,
    name: course.name,
    credits: course.credits,
    lecturer: course.lecturer,
    diff: course.diff || 'medium',
    rating: course.rating ?? 0,
    enrolled: course.enrolled ?? 0,
    category: course.category ?? 'cs',
    day: course.day,
    start_hour: course.start_hour ?? course.start,
    end_hour: course.end_hour ?? course.end,
    room: course.room,
    color: course.color,
  })
  if (error) throw error
}

export async function getGrades() {
  const id = await uid()
  if (!id) return []
  const { data } = await supabase.from('grades').select('*').eq('student_id', id)
  return data ?? []
}

export async function addGrade(grade) {
  const id = await uid()
  if (!id) return false
  const { error } = await supabase.from('grades').insert({ ...grade, student_id: id })
  return !error
}

export async function getFriends() {
  const id = await uid()
  if (!id) return []
  const { data } = await supabase.from('friends').select('*').eq('student_id', id)
  return (data ?? []).map(f => ({
    id: f.friend_id,
    name: f.friend_name,
    initial: f.friend_initial,
    color: f.color,
    shared: f.shared ?? [],
    group: f.grp,
  }))
}

export async function addFriend(friend) {
  const id = await uid()
  if (!id) throw new Error('לא מחובר')
  const { error } = await supabase.from('friends').insert({
    student_id: id,
    friend_id:      friend.id,
    friend_name:    friend.name,
    friend_initial: friend.initial,
    color:          friend.color ?? 'av-brand',
    shared:         friend.shared ?? [],
    grp:            friend.grp ?? null,
  })
  if (error) throw error
  return true
}

export async function removeFriend(friendId) {
  const id = await uid()
  if (!id) throw new Error('לא מחובר')
  const { error } = await supabase.from('friends')
    .delete().eq('student_id', id).eq('friend_id', friendId)
  if (error) throw error
  return true
}

export async function updateFriendGroup(friendId, grp) {
  const id = await uid()
  if (!id) throw new Error('לא מחובר')
  const { error } = await supabase.from('friends')
    .update({ grp }).eq('student_id', id).eq('friend_id', friendId)
  if (error) throw error
  return true
}

export async function searchStudents(q) {
  const { data, error } = await supabase.rpc('search_students', { query: q })
  if (error) return []
  return data ?? []
}

export async function checkSearchRpc() {
  const { error } = await supabase.rpc('search_students', { query: '__probe__' })
  return !error
}

export async function getRecommendations() {
  const { data } = await supabase.from('recommendations').select('*')
  return data ?? []
}

export async function getAllCourses() {
  const { data } = await supabase.from('courses').select('*')
  return (data ?? []).map(c => ({ ...c, start: c.start_hour, end: c.end_hour }))
}

export async function deleteCourse(code) {
  const { error } = await supabase.from('courses').delete().eq('code', code)
  return !error
}

export async function getLecturers() {
  const { data } = await supabase.from('lecturers').select('*').order('name')
  return data ?? []
}

export async function upsertLecturer(lecturer) {
  const { data, error } = await supabase.from('lecturers').upsert(lecturer).select().single()
  if (error) throw error
  return data
}

export async function deleteLecturer(id) {
  const { error } = await supabase.from('lecturers').delete().eq('id', id)
  return !error
}
