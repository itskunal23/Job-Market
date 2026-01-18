'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, User, Loader2 } from 'lucide-react'

interface OnboardingFormProps {
  onComplete: (userId: string, userName: string) => void
}

export default function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (selectedFile: File) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
    
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or DOCX file')
      return
    }

    if (selectedFile.size > 16 * 1024 * 1024) {
      setError('File size must be less than 16MB')
      return
    }

    setFile(selectedFile)
    setError('')
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    if (!file) {
      setError('Please upload your resume')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', name.trim())

      const response = await fetch('http://localhost:5000/api/upload-resume', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload resume')
      }

      const data = await response.json()
      
      if (data.success && data.userId) {
        onComplete(data.userId, data.resume.name || name)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload resume. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto mt-12"
    >
      <div className="rolewithai-card p-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-semibold text-espresso mb-4 font-serif">
            Welcome to RoleWithAI
          </h1>
          <p className="text-lg text-espresso opacity-70 rolewithai-voice">
            Let's get started by uploading your resume. We'll find the best job matches for you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-espresso mb-2">
              <User className="inline w-4 h-4 mr-2" />
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-crema bg-white text-espresso"
              placeholder="Enter your full name"
              disabled={isUploading}
            />
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block text-sm font-medium text-espresso mb-2">
              <FileText className="inline w-4 h-4 mr-2" />
              Upload Resume
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragActive ? 'border-crema bg-crema/10' : 'border-border'}
                ${file ? 'border-green-500 bg-green-50' : ''}
              `}
            >
              {file ? (
                <div className="space-y-2">
                  <FileText className="w-12 h-12 mx-auto text-green-600" />
                  <p className="text-espresso font-medium">{file.name}</p>
                  <p className="text-sm text-espresso opacity-60">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-sm text-espresso opacity-60 hover:opacity-100 underline"
                    disabled={isUploading}
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 mx-auto text-espresso opacity-40" />
                  <div>
                    <p className="text-espresso font-medium mb-1">
                      Drag and drop your resume here
                    </p>
                    <p className="text-sm text-espresso opacity-60">
                      or click to browse
                    </p>
                  </div>
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileInput}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="resume-upload"
                    className="inline-block px-6 py-2 bg-crema text-espresso rounded-lg cursor-pointer hover:bg-crema/90 transition-colors"
                  >
                    Choose File
                  </label>
                  <p className="text-xs text-espresso opacity-50 mt-2">
                    Supported formats: PDF, DOCX (Max 16MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading || !name.trim() || !file}
            className="w-full px-6 py-3 bg-espresso text-white rounded-lg font-medium hover:bg-espresso/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing your resume...
              </>
            ) : (
              <>
                Find My Matches
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-xs text-espresso opacity-50 text-center">
          Your resume data is processed securely and used only to find job matches.
        </p>
      </div>
    </motion.div>
  )
}
