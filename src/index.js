const crypto  = require('crypto')
const fs = require('fs')
const FormData = require('form-data')
const axios = require('axios')

const decode = (string, offset) => {
  let deciphered = ''

  for (let i = 0; i < string.length; i++) {
    const value = string[i].charCodeAt()

    if (value >= 97 && value <= 122) {
      const index = (value - 97 - offset) % 26

      if (index < 0) deciphered += String.fromCharCode(123 + index)
      else deciphered += String.fromCharCode(index + 97)
    } else {
      deciphered += String.fromCharCode(value)
    }
  }

  return deciphered
}

// Start request

axios.get(
  'https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=c3d8aeea7078bfa831cb875ce1a25a867adfe3a9'
 )
  .then(req => {
    const message = req.data

    message.decifrado = decode(message.cifrado, message.numero_casas)
    message.resumo_criptografico = crypto.createHash('sha1').update(message.cifrado).digest('hex')

    fs.writeFileSync('answer.json', JSON.stringify(message))
    console.log(message)

    const config = { 'Content-Type': 'multipart/form-data' } 
    const answer = new FormData()
    answer.append('answer', fs.createReadStream('answer.json'))

    return axios.post(
      'https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=c3d8aeea7078bfa831cb875ce1a25a867adfe3a9',
       answer,
       { headers: answer.getHeaders(), config }, 
    )
  }).then( _ => {
    console.log('Post success')
  }).catch(error => {
    console.log(error)
  }).then(_ => {
    console.log('delete file answer.json')
    fs.unlinkSync('answer.json')
    console.log('Mission accomplished')
  })