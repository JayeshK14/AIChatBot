import React,{ useState, useEffect, useRef } from 'react'
import {BsChatRightTextFill, BsChatLeftTextFill, BsSendFill} from "react-icons/bs"
function App() {
  const chatBoxwrapper = useRef()
  const chatBox = useRef()
  const [prompt, setPrompt] = useState("") //It stores everything which we type in input box
  const [typing, setTyping] = useState(false) //When we send our query,how much time it will take to respond. Jb tk response nhi aata tb tk typing true rhega aur response aate hi false krr denge
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT! Ask me anything!",
      sender: "assistant"
    }
  ])
  const [current, setCurrent] = useState("now") //Jaise hi koi data aayega hmare pass hum click krenge, hum setCurrent ko update krr denge aur waise hi hmara use effect run hoga aur use effect ke andr hum pass krr denge apni api ka function
  const systemMethod = {"role": "system", "content": "You are a helpful assistant."}

  const componsePrompt = (e) => {
    setPrompt(e.target.value)
  }
  const queryPrompt = () => {
    if(prompt !== ""){
      setTyping(true)
      setMessages(previousState => [...previousState, {message: prompt,
      sender: "user"}])
      setPrompt("")
      setCurrent(new Date().getMilliseconds());
    }
  }
  const fetchApi = async () => {
    let chatRoles = messages.map((obj) => {
      return {role: obj.sender, content: obj.message}
    })

    const reqBody = {
      "model":"gpt-3.5-turbo",
      "messages":[
        systemMethod,
        ...chatRoles
      ]
    }

    const api = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + import.meta.env.VITE_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(reqBody)
    })

    return api;
  } 

  useEffect(() => {
    if(current !== "now"){
      fetchApi().then(data => {
        return data.json()
      }).then(data => {
        setMessages(previousState => [...previousState, {message: data.choices[0].message.content,
          sender: "assistant"}])
        setTyping(false)
        chatBoxwrapper.current.scrollTop = chatBox.current.scrollHeight
      })
    }
  },[current])
  return (
    <div className='relative h-[100vh] mx-auto lg:max-w-2xl xl:max-w-3xl p-[10px]'>
      <div ref={chatBoxwrapper} className="wrapper overflow-auto h-[calc(100%-87px)] flex flex-col scroll-smooth">
        <div ref={chatBox}>
        {messages && messages.length > 0 && messages.map((message, index) => (
          <React.Fragment key={index}>
            <div className="flex px-3">
              <div className={`container mx-auto flex items-start ${message.sender === "assistant"? "flex-row": "flex-row-reverse"}`}>
                {message.sender === "assistant" 
                  ? <BsChatRightTextFill style={{fontSize:"30px", color:"#62ac9c", marginRight:"20px", marginTop: "10px"}} />
                  : <BsChatLeftTextFill style={{fontSize:"30px", color:"#fff", marginLeft:"20px", marginTop: "10px"}} />
                }
                <p className={`text-lg min-h-[52px] ${message.sender === "assistant" ? "bg-[#62ac9c] text-[#fff]": "bg-[#fff] text-[#000]"} 
                py-3 px-5 rounded-lg w-[calc(100%-42px)] my-1`}>{message.message}</p>
              </div>
            </div>
          </React.Fragment>
         ))}
        </div>
      </div>
      <div className="flex p-[5px] absolute w-full justify-center">
        <div className="container relative">
          <div className='p-4 bg-[#3e414e] rounded-sm flex justify'>
            {typing && <span className='absolute self-start top-[-20px] text-xs left-0 text-[#9ca3af]'>Typing...</span>}
            <input type="text" placeholder='Type your Prompt'
            onChange={componsePrompt}
            value={prompt}
            className='w-[calc(100%-6rem)] m-0 rounded-sm bg-[#353641] outline-none p-[10px] h-[45px] text-[#fff]'
            />
            <button
            onClick={queryPrompt}
            className='w-[5rem] flex items-center justify-center bg-[#353641] cursor-pointer'>
              <BsSendFill style={{fontSize: 20, color: "#fff"}} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
