require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const getColors = require('get-image-colors')
const { createWriteStream } = require('fs')
const { tmpdir } = require('os')
const { join } = require('path')
const { pipeline } = require('stream/promises')
const { v4: uuidv4 } = require('uuid')

const projectId = process.env.PROJECT_ID
const serviceRole = process.env.SERVICE_ROLE

if (!projectId || !serviceRole) {
  console.error('❌ Variáveis PROJECT_ID e SERVICE_ROLE não definidas no .env')
  process.exit(1)
}

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  serviceRole
)

const bucket = 'images'
const folder = 'templates'

async function main() {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder)

  if (error) {
    console.error('❌ Erro ao listar arquivos:', error)
    return
  }

  for (const file of data) {
    const filePath = `${folder}/${file.name}`
    const publicUrl = supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl

    try {
      const tmpPath = join(tmpdir(), uuidv4() + '-' + file.name)
      const response = await fetch(publicUrl)
      await pipeline(response.body, createWriteStream(tmpPath))

      const colors = await getColors(tmpPath)
      const hex = colors[0].hex()

      const name = file.name.replace('.png', '')

      const { error: insertError } = await supabase
        .from('templates')
        .insert([{ name, url: publicUrl, dominant_color: hex }])

      if (insertError) {
        console.error(`❌ Erro ao inserir ${name}:`, insertError)
      } else {
        console.log(`✅ Inserido: ${name} com cor ${hex}`)
      }
    } catch (err) {
      console.error(`⚠️ Erro com ${file.name}:`, err.message)
    }
  }
}

main()
