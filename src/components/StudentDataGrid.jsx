import React, { useState, useEffect, useCallback } from 'react'
import CustomStudentTable from './CustomStudentTable'
import { getStudents, getBatches } from '../services/supabase'

export default function StudentDataGrid() {
  const [students, setStudents] = useState([])
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [studentsRes, batchesRes] = await Promise.all([getStudents(), getBatches()])
    setStudents(studentsRes.data || [])
    setBatches(batchesRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading students...</div>
  }

  return <CustomStudentTable data={students} batches={batches} onRefresh={fetchData} />
}
