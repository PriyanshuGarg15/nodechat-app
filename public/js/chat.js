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
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
var {username,room} = Qs.parse(location.search, {ignoreQueryPrefix : true})

const autoScroll =()=>{
    //New Message Element
    const $newMessage = $messages.lastElementChild
    //Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    //Visible Height 
    const visibleHeight = $messages.offsetHeight
    //Height of Messages container
    const containerHeight = $messages.scrollHeight
    //How far I have Scrolles?
    const scrollOffSet = $messages.scrollTop + visibleHeight

    if(containerHeight-newMessageHeight  <= scrollOffSet){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()

})
socket.on('locationMessage', (url)=>{
    console.log(url)
    const html = Mustache.render(locationTemplate, {
        username: url.username,
        url: url.text,
        createdAt: moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
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
socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})
