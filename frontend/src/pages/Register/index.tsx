// 此页面为注册页面
import { Form,message,Popover } from 'antd'
import { Link,useNavigate } from "react-router-dom"
import {FC} from "react"
import ParticlesBg from 'particles-bg'
import "./index.css"
import axios from 'axios'

const Register:FC = () => {
    const nav = useNavigate()
    // 点击注册后的函数
    const onfinish = (values: string)=>{
        console.log('Received values of form: ', values)
        axios.post('/api/user/register',{data:JSON.stringify(values)})
        .then((res)=>{
            // 依据返回的code确定三个状态
            const code = res.data.data.data
            switch(code){
                case 1:
                    message.success('注册成功!')
                    nav('/login')
                    break;
                case 0:
                    message.warning('用户名已存在!')
                    break;
            }
        })
    }
    return (
        <div className='log-in'>
            <div className="backs">
                <Link to="/" className="gobacks">
                    <img className="home" src="./home.svg" alt="svg1" />
                    返回首页
                </Link>
            </div>
            <div className="login-in">
                <ParticlesBg type="circle" bg={true} />
                {/* 头部标题 */}
                <div className = "head">
                    <div >
                        <img src="./Home_nav_middle.png" alt="yun" />
                    </div>
                    <h1>嘟嘟收件箱</h1>
                </div>
                <div className='login-in-form-create'> 
                    <div style={{color:'#fafafc',fontSize:'26px',margin:'10px'}}>
                        用户注册
                    </div>
                    {/* 注册表单，使用Form组件 */}
                    <Form
                        name="normal_login"
                        className="login-form"
                        initialValues={{ remember: true }}
                        onFinish={onfinish}
                        >
                        {/* 用户名 包裹两层item防止报错*/}
                        <Form.Item name="Username">
                            <Form.Item name="Username" rules={
                                [
                                    { required: true, message: '用户名不可以为空' },
                                    {pattern:/^[0-9a-zA-Z]{1,}$/g,message:'只允许数字字母'},
                                ]} 
                            >
                                <Popover 
                                            content={<div style={{
                                                width: '100px',
                                                fontSize: '8px',
                                                lineHeight: '14px',
                                                color: '#757575',
                                            }}>请输入用户名(只允许数字字母)</div>}
                                            title={null}
                                            placement="leftTop"
                                            trigger="hover"
                                    >
                                    <input type="text" required className='input' />
                                    <span className='span-username'>Username</span>   
                                </Popover>
                            </Form.Item>
                        </Form.Item>
                        {/* 密码 包裹两层item防止报错*/}
                        <Form.Item name="Password" >
                            <Form.Item name="Password" rules={
                                [
                                    { required: true, message: '密码不可以为空' },
                                    {pattern:/(.[^a-z0-9])/g,message:'需大小写字母与数字'},
                                    {min:6,message:"长度不得小于6位"}
                                ]} 
                            >
                                     <Popover 
                                        content={<div style={{
                                            width: '125px',
                                            fontSize: '8px',
                                            lineHeight: '14px',
                                            color: '#757575',
                                        }}>请输入密码(大小写字母加数字,长度不少于6位)</div>}
                                        title={null}
                                        placement="leftTop"
                                        trigger="hover"
                                    >
                                    <input type="password" required className='input-password'/>
                                    <span className='span-password'>Password</span>
                                </Popover>
                            </Form.Item>
                        </Form.Item>
                        {/* 重复密码 */}
                        <Form.Item name="repeat-password" >
                            <Form.Item name="repeat-password" rules={
                                [
                                    { required: true, message: '密码不可以为空' },
                                    ({ getFieldValue }) => ({
                                        validator(rule, value) {
                                            if (!value || getFieldValue('Password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject('两次输入密码不同');
                                        },
                                    }),
                                ]
                                } 
                            >
                                <Popover 
                                        content={<div style={{
                                            width: '125px',
                                            fontSize: '8px',
                                            lineHeight: '14px',
                                            color: '#757575',
                                        }}>请确认密码(两次输入相同)</div>}
                                        title={null}
                                        placement="leftTop"
                                        trigger="hover"
                                >
                                    <input type="password" required className='repeat-password-creat'/>
                                    <span className='span-repeat-password-creat'>Repeat-Password</span>
                                </Popover>
                            </Form.Item>
                        </Form.Item>
                        {/* 邮箱 包裹两层item防止报错*/}
                        <Form.Item name="Email">
                            <Form.Item name="Email" rules={
                                [
                                    { required: true, message: '邮箱不可为空' },
                                    {
                                    pattern:/^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/g
                                    ,message:'请输入合法邮箱'},
                                ]} 
                            >
                                <Popover 
                                        content={<div style={{
                                            width: '125px',
                                            fontSize: '8px',
                                            lineHeight: '14px',
                                            color: '#757575',
                                        }}>请输入合法邮箱邮箱</div>}
                                        title={null}
                                        placement="leftTop"
                                        trigger="hover"
                                >
                                    <input type="text" required className='repeat-password-creat' />
                                    <span className='span-repeat-password-creat'>Email</span>   
                                </Popover>
                            </Form.Item>
                        </Form.Item>
                        {/* 注册按钮 */}
                        <Form.Item>
                            <button className="button" type='submit'>
                            注册
                            </button>
                        </Form.Item>
                    </Form>
                </div>
            </div>  
        </div>
        
    )
}
export default Register