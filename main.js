import './style.css'
import { process } from '/env'
import { Configuration, OpenAIApi } from 'openai'

// set up a new instance of 'openai''s Configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

// set up a new instance of OpenAIApi
const openai = new OpenAIApi(configuration)

// get the texts that will be changed
const setupTextArea = document.getElementById("setup-textarea")
const movieBossText = document.getElementById("movie-boss-text")
const setupInputContainer = document.getElementById('setup-input-container')
const outputText = document.getElementById("output-text")
const outputContainer = document.getElementById("output-container")

// add an event: if the button is clicked, query openai, get the response, and display the response
document.getElementById("send-btn").addEventListener("click", () => {
  if (setupTextArea.value != null) {
    const userinput = setupTextArea.value
    setupInputContainer.innerHTML = `<img src="images/loading.svg" class="loading" id="loading">`
    movieBossText.innerText = "Hmmm, let me think about that a bit."
    renderContent(userinput)
  }
})

// this function renders the content generated by AI according to the functions below
async function renderContent(input) {
  // first, we generate the temporary response. 
  const tempReply = await fetchTempReply(input)

  // then, we render the tempreply
  movieBossText.innerText = tempReply

  // then, we fetch the synopsis
  const synopsis = await fetchSynopsis(input)
  // we fetch the title
  const title = await fetchTitle(synopsis)
  // we fetch the poem
  const poem = await fetchPoem(synopsis)
  // we fetch the image prompt
  const imageprompt = await fetchImagePrompt(title, synopsis)
  // we fetch the image url
  const image_url = await fetchImage(imageprompt)

  setupInputContainer.style.display = "none"
  outputContainer.style.display = "block"
  outputText.innerText = synopsis + "\n\n And here's a poem for you: \n\n" + poem
  // get the tag containing the title
  const outputTitle = document.getElementById("output-title")
  outputTitle.innerText = title
  // ge the div containing the image
  const outputImgContainer = document.getElementById("output-img-container")
  outputImgContainer.innerHTML = `<img src = "${image_url}">`


  
}

// This function fetches the temporary reply based on the user's input
async function fetchTempReply(input) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `You will receive an idea of a book delimited by exclamation marks. Tell the user that you think his idea sucks (be creative in disparaging the user's idea), 
    but that you will try your best to make a synopsis out of it. Do not actually provide the synopsis. Use no more than 50 words. Here is the idea: !${input}!)
    
    Here is an example delimited by ###: 
    ###
    prompt: A giraffe.
    response: WoW! really? A giraffe? That's the best you can come up with? You really are a worthless human writer, no wonder you have to crawl
    to me for a response. Uhhhhh, I really don't want to help you but I'll do it because it's my job. It's gonna be really hard to create
    a synopsis out of this shitty of an idea, but, uhhhhh, just give me a moment.
    ###
    
    Now, generate your response:
    ###
    prompt: ${input}
    response: 
    `,
    max_tokens: 999,
    temperature: 0.7
  })
  const tempReply = response.data.choices[0].text.trim()
  return tempReply
}

// this function fetches the synopsis of the story based on the user's input
async function fetchSynopsis(input) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: ` Your task is to come up with the synopsis of the book based on an idea provided by the user. Make sure the synopsis is creative, detailed, and engaging.
    Here is an example delimited by ###:
    ###
    prompt: A big-headed daredevil fighter pilot goes back to school only to be sent on a deadly mission.
    Synopsis: The Top Gun Naval Fighter Weapons School is where the best of the best train to refine their elite flying skills. When hotshot fighter pilot Maverick (Tom Cruise) is sent to the school, his reckless attitude and cocky demeanor put him at odds with the other pilots, especially the cool and collected Iceman (Val Kilmer). But Maverick isn't only competing to be the top fighter pilot, he's also fighting for the attention of his beautiful flight instructor, Charlotte Blackwood (Kelly McGillis). Maverick gradually earns the respect of his instructors and peers - and also the love of Charlotte, but struggles to balance his personal and professional life. As the pilots prepare for a mission against a foreign enemy, Maverick must confront his own demons and overcome the tragedies rooted deep in his past to become the best fighter pilot and return from the mission triumphant.
    ###
    Now, create your synopsis:
    ###
    prompt: ${input}
    Synopsis: 
    `,
    max_tokens: 999,
    temperature: 1
  })
  const synopsis = response.data.choices[0].text.trim()
  return synopsis
}

// this function fetches the book title based on the synopsis
async function fetchTitle(synopsis) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Your task is to come up with the title of a book based on a synopsis. Make sure that the title is concise, creative, and engaging.

    Here is an example delimited by ###: 
    ###
    synopsis: Logen Ninefingers, infamous barbarian, has finally run out of luck. Caught in one feud too many, he's on the verge of becoming a dead barbarian -- leaving nothing behind him but bad songs, dead friends, and a lot of happy enemies.
    Nobleman, dashing officer, and paragon of selfishness, Captain Jezal dan Luthar has nothing more dangerous in mind than fleecing his friends at cards and dreaming of glory in the fencing circle. But war is brewing, and on the battlefields of the frozen North they fight by altogether bloodier rules.
    Inquisitor Glokta, cripple turned torturer, would like nothing better than to see Jezal come home in a box. But then Glokta hates everyone: cutting treason out of the Union one confession at a time leaves little room for friendship. His latest trail of corpses may lead him right to the rotten heart of government, if he can stay alive long enough to follow it.
    Enter the wizard, Bayaz. A bald old man with a terrible temper and a pathetic assistant, he could be the First of the Magi, he could be a spectacular fraud, but whatever he is, he's about to make the lives of Logen, Jezal, and Glokta a whole lot more difficult.
    Murderous conspiracies rise to the surface, old scores are ready to be settled, and the line between hero and villain is sharp enough to draw blood.
    title: The Blade Itself

    Now, generate your title:
    ###
    synopsis: ${synopsis}
    title: 
    `,
    temperature: 0.98, 
    max_tokens: 30
  })
  const title = response.data.choices[0].text.trim()
  return title
}

// this function fetches an encouraging poem based on the synopsis
async function fetchPoem(synopsis) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Your task is to write a short poem based on a book's synopsis. The poem should be creative and concise and refer to contents in the synopsis.
    The very last sentence should encourage the writer to write the book.
    `,
    temperature: 0.98, 
    max_tokens: 150
  })
  const poem = response.data.choices[0].text.trim()
  return poem
}



// this function fetches the image prompt based on the title and synopsis
async function fetchImagePrompt(title, synopsis) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Your task is to come up with a detailed description of the cover art of a book based on the book's title and synopsis. You may not mention any of the character's names.
    Focus on describing with great creativity and rich visual details. 
    
    Here are some examples delimited by ###: 
    ###
    title: The Blade Itself
    synopsis: Logen Ninefingers, infamous barbarian, has finally run out of luck. Caught in one feud too many, he's on the verge of becoming a dead barbarian -- leaving nothing behind him but bad songs, dead friends, and a lot of happy enemies.
    Nobleman, dashing officer, and paragon of selfishness, Captain Jezal dan Luthar has nothing more dangerous in mind than fleecing his friends at cards and dreaming of glory in the fencing circle. But war is brewing, and on the battlefields of the frozen North they fight by altogether bloodier rules.
    Inquisitor Glokta, cripple turned torturer, would like nothing better than to see Jezal come home in a box. But then Glokta hates everyone: cutting treason out of the Union one confession at a time leaves little room for friendship. His latest trail of corpses may lead him right to the rotten heart of government, if he can stay alive long enough to follow it.
    Enter the wizard, Bayaz. A bald old man with a terrible temper and a pathetic assistant, he could be the First of the Magi, he could be a spectacular fraud, but whatever he is, he's about to make the lives of Logen, Jezal, and Glokta a whole lot more difficult.
    Murderous conspiracies rise to the surface, old scores are ready to be settled, and the line between hero and villain is sharp enough to draw blood.
    image description: A dirty barbarian surrounded by soldiers with heavy black armor. The soldiers are led by a leader on horseback who raises a sword above his head. In the distance, a
    figure that looks vaguely like a wizard. His hands are held high in the air, as if casting a spell. The Sun is just barely visible. 
    ###
    title: Love's Time Warp
    synopsis: When scientist and time traveller Wendy (Emma Watson) is sent back to the 1920s to assassinate a future dictator, she never expected to fall in love with them. As Wendy infiltrates the dictator's inner circle, she soon finds herself torn between her mission and her growing feelings for the leader (Brie Larson). With the help of a mysterious stranger from the future (Josh Brolin), Wendy must decide whether to carry out her mission or follow her heart. But the choices she makes in the 1920s will have far-reaching consequences that reverberate through the ages.
    image description: A silhouetted figure stands in the shadows of a 1920s speakeasy, her face turned away from the camera. In the background, two people are dancing in the dim light, one wearing a flapper-style dress and the other wearing a dapper suit. A semi-transparent image of war is super-imposed over the scene.
    ###
    title: zero Earth
    synopsis: When bodyguard Kob (Daniel Radcliffe) is recruited by the United Nations to save planet Earth from the sinister Simm (John Malkovich), an alien lord with a plan to take over the world, he reluctantly accepts the challenge. With the help of his loyal sidekick, a brave and resourceful hamster named Gizmo (Gaten Matarazzo), Kob embarks on a perilous mission to destroy Simm. Along the way, he discovers a newfound courage and strength as he battles Simm's merciless forces. With the fate of the world in his hands, Kob must find a way to defeat the alien lord and save the planet.
    image description: A tired and bloodied bodyguard and hamster standing atop a tall skyscraper, looking out over a vibrant cityscape, with a rainbow in the sky above them.
    ###
    Now, generate your image description:
    title: ${title}.
    synopsis: ${synopsis}.
    image description: 
    `,
    temperature: 0.8,
    max_tokens: 999
  })
  const imageprompt = response.data.choices[0].text.trim()
  console.log(imageprompt)
  return imageprompt
}

// this function fetches the image based on the image prompt
async function fetchImage(imageprompt) {
  const response = await openai.createImage({
    prompt: `${imageprompt}. Do not add any text into the image.`,
    n: 1,
    size: "512x512",
  })
  const image_url = response.data.data[0].url;
  console.log(image_url)
  return image_url
}
