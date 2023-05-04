// 此页面为首页
import {FC,useEffect, useState} from "react"
import 'antd/lib/dropdown/style/css'
import "./index.css"
import { Link,useNavigate } from "react-router-dom"
import {ExclamationCircleOutlined} from '@ant-design/icons'
import { Modal, message,Popover } from 'antd'
import axios from "axios"
const Home:FC = ()=>{
  const nav = useNavigate()
  const linkto = () =>{
    // 未登录不跳转，弹出error，跳转至登录页面
    if(!log){
      message.error("请先登录!")
      nav('/login')
    }
    else{
      nav('/File_collecting',{state:{data:-1}})
    }
  }  
  const linktos = () =>{
    // 未登录不跳转，弹出error，跳转至登录页面
    if(!log){
      message.error("请先登录!")
      nav('/login')
    }
    else{
      nav('/Mycollection',{state:{data:-1}})
    }
  }
  // 定义退出modal
  const [modal, contextHolder] = Modal.useModal()
  // 定义注销modal
  const [modals, contextHolders] = Modal.useModal()
  // showmodal函数
  // 退出登录，应弹出窗口提示,确认后退出
  const showmodal = () => {
    modal.confirm({
      title: '警告',
      icon: <ExclamationCircleOutlined />,
      content: '确认退出登录吗',
      okText: '确认',
      cancelText: '取消',
      onOk:()=>{
          logout()
      },
    })
  }
  // showmodals函数
  // 注销账户，应弹出窗口提示,确认后注销
  const showmodals = () => {
    setOpen(false)
    modals.confirm({
      title: '警告',
      icon: <ExclamationCircleOutlined />,
      content: '确认注销该账户吗,注销后该账户不再存在!',
      okText: '确认',
      cancelText: '取消',
      onOk:()=>{
          unregister()
      },
    })
  }
  // 注销函数
  const unregister = ()=>{
    axios.post('/api/user/unregister')
      .then(()=>{
        setLog(false)
        setUsername('')
      })
  }
  // 退出函数
  const logout = () =>{
    axios.post('/api/user/logout')
      .then(()=>{
        setLog(false)
        setUsername('')
      })
  }
  const [username,setUsername] = useState("")
  const [log,setLog] = useState(false)
  const [open,setOpen] = useState(false)
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }
  const content = (
    <div>
      <Link to="/Personel" className="personal">个人中心</Link>
      <div style={{marginTop:'5px'}}>
        <div className="unregister" onClick={showmodals}>注销账户</div>
        {contextHolders}
      </div>
    </div>
  )
  // 使用axios获得用户名
  useEffect(()=>{
    axios.get('/api/user/index')
    .then((res)=>{
        // 依据返回的code确定三个状态
        const code = res.data.data.code
        if(code === 1){
          const username = res.data.data.username
          // 设置用户名
          setUsername(username)
          setLog(true)
        }
    })
  },[])
  return (
    <div className="Home">
      {/* top_nav */}
      <nav>
        <div className="left">
          <button onClick={linkto} className="linktoo">创建收集</button>
          <button onClick={linktos} className="linktoo">收集记录</button>
        </div>
        <div className="middle">
          {/* <a target="_black" href="https://view.officeapps.live.com/op/view.aspx?src=http://mczaiyun.top/ht/123.xlsx">预览文件</a> */}
          <div id="nav_productName">
            <img id="nav_image" src="./Home_nav_middle.png" alt="nav"/>
            <div>
              嘟嘟收件箱
            </div>
          </div>
        </div>
        {/* judge by is_loginin */}
        <div className="right">
          {/*  if current_user.is_authenticated  */}
          <div id="nav_op3" className="nav_op" style={{display:log?'flex':'none'}}>
            {/* 下拉菜单，个人中心或者注销账户 */}
            <Popover content={content} open={open} trigger="hover" onOpenChange={handleOpenChange}>
              <a onClick={(e) => e.preventDefault()}>
              {username}
              </a>
            </Popover>
            {/* <Link to="/Personel" className="login">{username}</Link> */}
          </div>
          <div id="nav_op4"  style={{display:log?'flex':'none'}}>
            <button onClick={showmodal} className="linktoo">退出登录</button>
            {contextHolder}
          </div>
          {/*  else  */}
          <div id="nav_op3" className="nav_op" style={{display:log?'none':'flex'}}>
            <Link to="/Login" className="login">登录</Link>
          </div>
          <div id="nav_op4" className="nav_op" style={{display:log?'none':'flex'}}>
            <Link to="/Register" className="register">注册</Link>
          </div>
          {/*  endif  */}
        </div>
      </nav>
      <section className="container panel one">
        <div className="main">
          <h1 id="productName">嘟嘟收件箱</h1>
          <h1 id="EnglishName">Dodoco Inbox</h1>
          <div className="underProductName">
              <h2>文件收集、题目收集、问卷收集</h2>
              {/* 未登录不可跳转 */}
              <button onClick={linkto} className="createCollection">创建收集</button>
          </div>   
        </div>
        <img id="round_right" src="./round1.png" alt="round1" />
        <img id="round_left" src="./round2.png" alt="round2" />
        <img id="svg1" src="./1.svg" alt="svg1" />
      </section>
      <section className="panel two" >
        <div className="textBox">
          <div className="pageTitle">
            <h1>收件，</h1>
            <h2>不止于文件</h2>
          </div>
          <div className="paragraph">
            <p>我们提供了6种格式的常见收集选项：</p>
            <p>姓名、学号、文件、单选、多选、问卷题目</p>
          </div>
          <div className="paragraph">
            <p>您可以选择任意题目创建一个收集，</p>
            <p>或者根据需求编辑题目名称，自定义题目</p>
          </div>
        </div>
        <img id="collectioncard" src="./collectioncard_2.png" alt="collectioncard_2" />
      </section>
      <section className="panel three" >
        <div className="textBox">
          <div className="pageTitle">
            <h1>复用，</h1>
            <h2>一个收集不只用一次</h2>
          </div>
          <div className="paragraph">
            <p>对于每一个收集，我们提供了多种操作：</p>
            <p>编辑、复制、停止、重启......</p>
          </div>
          <div className="paragraph">
            <p>您可以对已创建的收集进行修改，</p>
            <p>或者复用以前创建的收集</p>
          </div>
        </div>
        <img id="mycollectioncard" src="./mycollectioncard_1.png" alt="mycollectioncard_1" />
      </section>
      <section className="panel four" >
        <div className="textBox">
          <div className="pageTitle">
            <h1>统计，</h1>
            <h2>提交情况一目了然</h2>
          </div>
          <div className="paragraph">
            <p>您可以将应交名单导入，</p>
            <p>已提交和未提交姓名将由不同颜色区分</p>
          </div>
          <div className="paragraph">
            <p>对于每一次提交，</p>
            <p>您可以看到提交者姓名、提交时间、文件数量等信息</p>
          </div>
        </div>
        <img id="collectiondetailcard" src="./collectiondetailcard_1.png" alt="collectiondetailcard_1" />
      </section>
      <section className="panel five" >
        <div id="aboveFooter">
          <div id="docLinkBox">
            我们的项目地址:
          </div>
          <a id="docLink" target="_blank" rel="noopener noreferrer" href="https://github.com/Slapaf/DODO-HUB.git">
            https://github.com/Slapaf/DODO-HUB.git
          </a>
        </div>
        <img src="./left-top.png" className="yuanshen" id="left-top" alt="left-top"/>
        <img src="./left-bottom.png" className="yuanshen" id="left-bottom" alt="left-bottom"/>
        <img src="./right-top.png" className="yuanshen" id="right-top" alt="right-top"/>
        <img src="./right-bottom.png" className="yuanshen" id="right-bottom" alt="right-bottom"/>
      </section>
    </div>
  );
}

export default Home
