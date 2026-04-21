import sharp from 'sharp'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="#6366f1"/>
  <text x="50" y="68" font-family="system-ui" font-size="54" font-weight="bold"
    text-anchor="middle" fill="white">T</text>
</svg>`

const buf = Buffer.from(svg)

await sharp(buf).resize(180, 180).png().toFile('public/icons/icon-180.png')
await sharp(buf).resize(192, 192).png().toFile('public/icons/icon-192.png')
await sharp(buf).resize(512, 512).png().toFile('public/icons/icon-512.png')

console.log('Icons generated.')
