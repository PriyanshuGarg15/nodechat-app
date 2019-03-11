const socket = io()
//Elements
var $messageForm = document.querySelector('#message-form')
var $messageFormInput = $messageForm.querySelector('input')
var $messageFormButton = $messageForm.querySelector('button')
var $locationButton = document.querySelector('#send-location')
var $messages = document.querySelector('#messages')

//Template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML

socket.on('message', (message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)

})
socket.on('locationMessage', (url)=>{
    console.log(url)
    const html = Mustache.render(locationTemplate, {url})
    $messages.insertAdjacentHTML('beforeend', html)
    // const html = Mustache.render(messageTemplate, {message})
    // $messages.insertAdjacentHTML('beforeend', html)

})

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = $messageFormInput.value;

    socket.emit('sendMessage', message, (err)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(err){
            return console.log(err)
        }
        console.log('Message delivered!')
    })
})

$locationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Location Sharing not supported in your browser')
    }
    $locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        var latitude = position.coords.latitude
        var longitude = position.coords.longitude
        var location ={latitude, longitude}
        socket.emit('send-location', location, ()=>{
            console.log('Location Shared!')
            $locationButton.removeAttribute('disabled')

        })
    })
})