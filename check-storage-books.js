const https = require('https')
const fs = require('fs')
const path = require('path')

// 读取环境变量
const envPath = path.join(__dirname, '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')

const SUPABASE_URL = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]
const SERVICE_KEY = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ 无法读取 Supabase 配置')
  process.exit(1)
}

const API_URL = SUPABASE_URL.replace('https://', '')

console.log('🔍 检查 Supabase Storage 配置...\n')

// 检查 books bucket 是否存在
function checkBucket() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_URL,
      path: '/storage/v1/bucket/books',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        if (res.statusCode === 200) {
          const bucket = JSON.parse(data)
          console.log('✅ books 存储桶存在')
          console.log('   - ID:', bucket.id)
          console.log('   - Public:', bucket.public)
          console.log('   - File size limit:', bucket.file_size_limit || 'unlimited')
          resolve(bucket)
        } else {
          console.log('❌ books 存储桶不存在或无法访问')
          console.log('   状态码:', res.statusCode)
          console.log('   响应:', data)
          reject(new Error('Bucket not found'))
        }
      })
    })

    req.on('error', (e) => {
      console.error('❌ 请求失败:', e.message)
      reject(e)
    })

    req.end()
  })
}

// 测试上传权限
function testUpload() {
  return new Promise((resolve, reject) => {
    const testContent = Buffer.from('test file content')
    const fileName = `test/${Date.now()}_test.txt`

    const options = {
      hostname: API_URL,
      path: `/storage/v1/object/books/${fileName}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': 'text/plain',
        'Content-Length': testContent.length,
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('\n✅ 测试上传成功')
          console.log('   文件路径:', fileName)
          resolve()
        } else {
          console.log('\n❌ 测试上传失败')
          console.log('   状态码:', res.statusCode)
          console.log('   响应:', data)
          reject(new Error('Upload failed'))
        }
      })
    })

    req.on('error', (e) => {
      console.error('❌ 上传请求失败:', e.message)
      reject(e)
    })

    req.write(testContent)
    req.end()
  })
}

// 运行检查
async function main() {
  try {
    await checkBucket()
    await testUpload()
    console.log('\n🎉 Storage 配置正常！\n')
  } catch (error) {
    console.error('\n❌ Storage 配置有问题，请检查:\n')
    console.log('1. 确认已在 Supabase Dashboard 创建 books 存储桶')
    console.log('2. 确认存储桶设置为 Public')
    console.log('3. 确认 RLS 策略已正确配置\n')
    console.log('请访问: https://supabase.com/dashboard/project/' + API_URL.split('.')[0] + '/storage/buckets')
  }
}

main()
