// 此页面为登录页面
import { Link, useNavigate } from "react-router-dom"
import { Form,message,Popover } from 'antd'
import {FC} from "react"
import ParticlesBg from 'particles-bg'
import axios from 'axios'
import "./index.css"
const Login:FC = () => {
    const nav = useNavigate()
    // 点击登录后判断合法的函数
    const onfinish = (values: string)=>{
        console.log('Received values of form: ', values)
        // 接收数据后将数据传入后端进行验证
        axios.post('/api/user/login',{data:JSON.stringify(values)})
        .then((res)=>{
            // 依据返回的code确定三个状态
            const code = res.data.data.data
            console.log(code)
            switch(code){
                case 1:
                    message.success('登录成功!')
                    nav('/')
                    break;
                case 0:
                    message.warning('密码错误!')
                    break;
                default:
                    message.error('用户不存在!')
            }
        })
    }
    return (
        <div className="log-in">
            {/* 返回首页 */}
            <div className="backs">
                <Link to="/" className="gobacks">
                    <img className="home" src="./home.svg" alt="svg1" />
                    {/* <HomeOutlined style={{margin:"0 10px 0 0"}}/> */}
                    返回首页
                </Link>
            </div>
            <div className="login-in">
                <ParticlesBg type="circle" bg={true} />
                {/* 头部标题 */}
                <div className = "head">
                    <div >
                        <img src="./Home_nav_middle.png" alt="head" />
                    </div>
                    <h1>嘟嘟收件箱</h1>
                </div>
                {/* 表单 */}
                <div className='login-in-form'> 
                    <div style={{color:'#fafafc',fontSize:'26px',margin:'10px'}}>
                        欢迎登录
                    </div>
                    {/* 登录表单，使用Form组件 */}
                    <Form
                        name="normal_login"
                        className="login-form"
                        initialValues={{ remember: true }}
                        onFinish={onfinish}
                        >
                        {/* 用户名 包裹两层item防止报错*/}
                        <Form.Item name="Username">
                            <Form.Item name="Username">
                                <Popover 
                                        content={<div style={{
                                            width: '90px',
                                            fontSize: '15px',
                                            lineHeight: '15px',
                                            color: '#757575',
                                        }}>请输入用户名</div>}
                                        title={null}
                                        placement="leftTop"
                                        trigger="hover"
                                    >
                                    <input type="text" required className='input'/>
                                    <span className='span-username'>Username</span> 
                                </Popover>  
                            </Form.Item>
                        </Form.Item>
                        {/* 密码 包裹两层item防止报错*/}
                        <Form.Item name="Password" >
                            <Form.Item name="Password" >
                                <Popover 
                                            content={<div style={{
                                                width: '75px',
                                                fontSize: '15px',
                                                lineHeight: '15px',
                                                color: '#757575',
                                            }}>请输入密码</div>}
                                            title={null}
                                            placement="leftTop"
                                            trigger="hover"
                                        >
                                    <input type="password" required className='input-password' />
                                    <span className='span-password'>Password</span>
                                </Popover> 
                            </Form.Item>
                        </Form.Item>
                        {/* 跳转至创建账户页面 */}
                        <Form.Item>
                            <Link to="/Register" className="link">没有账号?点击创建</Link>
                        </Form.Item>
                        {/* 登录按钮 */}
                        <Form.Item>
                            <button type="submit" className="button" >
                            登录
                            </button>
                        </Form.Item>
                    </Form>
                </div>
            </div>  
        </div>
    )
}
export default Login