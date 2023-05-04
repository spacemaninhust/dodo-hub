// 此页面为个人中心页面
// 个人中心包括我的信息，修改密码，返回主页
import { FC,useEffect,useState } from "react"
import { Link } from "react-router-dom"
import {
    Form,
    Input,
    message,
} from 'antd'
import ParticlesBg from 'particles-bg'
import 'antd/lib/input/style/css'
import './index.css'
import axios from "axios"
// 局部生效样式
import styles from './index.module.css'
const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 30 },
      sm: { span: 16 },
    },
}
const iniuserinfo = {
    username:'',
    email:''
}
const Personel:FC = ()=>{
    const [form] = Form.useForm()
    const [modify,setModify] = useState(false) 
    const [modified,setModified] = useState(false)
    const [userinfo,setUserinfo] = useState(iniuserinfo)
    // 修改信息完成
    const finishmodify = (values:string)=>{
        userinfo.username = JSON.parse(JSON.stringify(values)).username === undefined?userinfo.username:JSON.parse(JSON.stringify(values)).username
        userinfo.email = JSON.parse(JSON.stringify(values)).email === undefined?userinfo.email:JSON.parse(JSON.stringify(values)).email
        setUserinfo({...userinfo})
        console.log(userinfo)
        console.log(values)
        axios.post('/api/admin/personalinfo',{data:JSON.stringify(userinfo)})
        .then((res)=>{
            const code = res.data.data.data
            if(code === 1){
                message.success('修改成功!')
                setModify(false)
            }
        })
    }
    const set =(e:any)=>{
        if(e.keyCode === 13){
            e.preventDefault()
        }
    }
    // 修改密码完成
    const finishchange = (values:string)=>{
        let datas = {
            oldpassword:JSON.parse(JSON.stringify(values)).oldpassword,
            newpassword:JSON.parse(JSON.stringify(values)).newpassword
        }
        console.log(datas)
        // 发送
        axios.post('/api/admin/password',{data:JSON.stringify(datas)})
        .then((res)=>{
            const code = res.data.data.data
            if(code === 1){
                message.success('修改密码成功!')
            }else{
                message.error('原密码不对!')
            }
        })
    }
    // 获得userinfo
    const getuserinfo = ()=>{
        axios.get('/api/admin/personalinfo')
        .then((res)=>{
            // const username = res.data.data.Username
            // const email = res.data.data.Email
            userinfo.username = res.data.data.Username
            userinfo.email = res.data.data.Email
            setUserinfo({...userinfo})
        })
    }
    useEffect(()=>{
        getuserinfo()
    },[])
  return (
    <div style={{display:'flex'}}>
        <ParticlesBg type="cobweb" bg={true} />
        <div className="nav">
            {/* <!--头像--> */}
            <div className="myicon">
                <div className="icon-img"><img src="./portrait.png" alt="portrait" /></div>
                <div className="icon-con">
                    <p>你好</p>
                    <h2>{userinfo.username}</h2>
                </div>
            </div>
            {/* <!-- 分隔线 --> */}
            <div className="line"></div>
                <div className="tab_list">
                    <div className="tab_list_item" id="item1" onClick={()=>setModified(false)}>
                        <div className="light"></div>
                        <div className="con">
                            <img className="home" style={{width:'20px'}} src="./personel.svg" alt="svg1" />
                            我的信息
                        </div>
                    </div>
                    <div className="tab_list_item" id="item2" onClick={()=>setModified(true)}>
                        <div className="light"></div>
                        <div className="con">
                            <img className="home" style={{width:'20px'}} src="./password.svg" alt="svg1" />
                            修改密码
                        </div>
                    </div>
                    <div className="tab_list_item" id="item3">
                        <div className="light"></div>
                        <div className="con">
                            <Link to="/" id="goback">
                                <img className="home" style={{width:'20px'}} src="./home.svg" alt="svg1" />
                                返回主页
                            </Link>
                        </div>
                    </div>
            </div>
        </div>
        <div className="item user_information" style={{display:modified?'none':'flex'}}>
            <div className="user_data">
                <img src="./portrait.png" alt="" className="photo"/>
                <div id="data1" style={{display:modify?'none':'flex'}}>
                    <div className="input_boxs"> 用户名称：<input type="text" name="username" className="inputs" disabled={true} id="input4_1" value={userinfo.username}/> 
                    </div>
                    <div className="input_boxs"> 用户邮箱：<input type="email" name="email" className="inputs" disabled={true} id="input6_1" value={userinfo.email}/>
                    </div>
                    {/* <div className="input_boxs"> 邮箱授权：<input type="text"  name="authorization-code" className="inputs" disabled={true} id="input7_1" value="未设置"/>
                    </div> */}
                    <button className="btn" onClick={()=>setModify(true)}>点击修改信息</button> 
                </div>
                <div id="data2" style={{display:modify?'flex':'none'}}>
                    <div id="goBackToData1" onClick={()=>setModify(false)}>
                        <img src="./back.svg" alt="back" className="home" style={{width:'18px',paddingTop:'2px'}} />
                        返回
                    </div>
                    <Form onFinish={finishmodify} id="Form">
                        <Form.Item name="username">
                            <div className="input_boxs">
                                用户名称：
                                <input onKeyDown={(e)=>set(e)} type="text" name="username" className="inputs"defaultValue={userinfo.username}/>
                            </div>
                        </Form.Item>
                        <span className="tip_box1" id="tip4"></span>
                        <span className="tip_box1" id="tip5"></span>
                        <Form.Item name="email">
                            <div className="input_boxs">
                                用户邮箱：
                                <input onKeyDown={(e)=>set(e)} type="email" name="email" className="inputs" defaultValue={userinfo.email}/>
                            </div>
                        </Form.Item>
                        {/* <Form.Item name="status">
                            <div className="input_boxs">
                                邮箱授权：
                                <input onKeyDown={(e)=>set(e)} type="text" name="authorization-code" className="inputs" defaultValue="未设置"/>
                            </div>
                        </Form.Item> */}
                        <button type="submit" className="btn">提交修改</button>
                    </Form>
                </div>
            </div>
        </div>
        <div className="item change_password" style={{display:modified?'flex':'none'}}>
            <div className="user_data" >
                 <Form
                    className={styles.coupon}
                    {...formItemLayout}
                    form={form}
                    name="changepw"
                    onFinish={finishchange}
                    style={{ width:"90%" }}
                    scrollToFirstError
                >
                    {/* 旧密码 */}
                    <Form.Item
                        name="oldpassword"
                        rules={[
                        {
                            required: true,
                            message: '请输入密码!',
                        }
                        ]}
                    >
                        <Form.Item>
                            <div className="label">
                                旧密码:
                            </div>
                            <Input.Password />
                        </Form.Item>
                    </Form.Item>
                    {/* 新密码 */}
                    <Form.Item
                        name="newpassword"
                        rules={[
                        {
                            required: true,
                            message: '请输入新密码!',
                        },
                        {pattern:/(.[^a-z0-9])/g,message:'需大小写字母与数字'},
                        {min:6,message:"长度不得小于6位"}
                        ]}
                    >
                        <Form.Item>
                            <div className="label">
                                新密码:
                            </div>
                            <Input.Password />
                        </Form.Item>
                    </Form.Item>
                    {/* 确认密码 */}
                    <Form.Item
                        name="confirm"
                        dependencies={['Password']}
                        rules={[
                        {
                            required: true,
                            message: '请确认密码!',
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                            if (!value || getFieldValue('newpassword') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('两次密码不同!'));
                            },
                        }),
                        ]}
                    >
                        <Form.Item>
                            <div className="label">
                                确认密码:
                            </div>
                            <Input.Password />
                        </Form.Item>
                    </Form.Item>
                    <Form.Item id="last">
                        <button type="submit" className="btn" id="btn2" >
                            提交修改
                        </button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    </div>
  )
}
export default Personel