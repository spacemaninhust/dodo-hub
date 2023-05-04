// 此页面为创建收集页面
import { FC,useState,useEffect } from 'react'
import 'antd/lib/modal/style/css'
import { useLocation } from 'react-router-dom'
import Question from '../../components/questions'
import { createThrottle } from '../../components/help'
import { DataTypes } from '../../components/datatype'
import { Restypes } from '../../components/datatype'
// 引入moment获得时间
import  moment from "moment"
import { Divider,Form,Popover,message } from 'antd'
import 'antd/lib/popover/style/css'
import 'antd/lib/message/style/css'
import './index.css'
import axios from 'axios'
// question列表初始值
const inihead = {
    Title:"",
    Collector:"",
    Deadline:"",
    Description:""
}
const iniQuess: DataTypes[] = []
const inires: Restypes[] = []
const inicontent = {
    head:inihead,
    question:iniQuess
}
const ress = {
    collection_info:{
        id:"",
        SubmitTime:""
    },
    question_info:inires
}
const File_submitting:FC = () => {
    // 答案
    // const [res,setRes] = useState([{}])
    const [ans,setAns] = useState(ress)
    // 获取头部
    const [contents,setContents] = useState(inicontent)
    // 获取当前时间判断是否跳转
    const [overtime,setOvertime] = useState(false)
    // 获得路由
    const location = useLocation()
    // 获得路由id
    const id = location.pathname.split('/')[2]
    const getcontents = ()=>{
        const tmpd = moment().format('YYYY-MM-DD HH:mm:ss')
        axios.get(`/api/collection/submit/${id}`)
        .then((res)=>{
            // 获得头以及问题
            const tmp = res.data.data
            // 问题头部
            const info = tmp.collection_info
            contents.head.Title = String(info.Title)
            contents.head.Collector = String(info.Collector)
            contents.head.Deadline = String(info.Deadline)
            contents.head.Description = String(info.Description)
            const ques = tmp.questions_info
            // 遍历每一个问题获取问题
            // 并且将答案列表设置初始值
            for(let i = 0;i < ques.length;i++){
                let tmp:DataTypes = {
                    qid:String(ques[i].Qid),
                    id:String(ques[i].Seqnum),
                    value:Number(ques[i].Qtype),
                    content:{
                        title:String(ques[i].Title),
                        description:String(ques[i].Description),
                        ans:String(ques[i].Renamerule).split(',').map(Number),
                        A:String(ques[i].Options.A),
                        B:String(ques[i].Options.B),
                        C:String(ques[i].Options.C),
                        D:String(ques[i].Options.D)
                    },
                    require:Number(ques[i].Require)
                }
                contents.question.push(tmp)
                // 初始化答案
                let tmp2 = {
                    Title:String(ques[i].Title),
                    Qid:String(ques[i].Qid),
                    Qtype:String(ques[i].Qtype),
                    Seqnum:String(i + 1),
                    Ans:""
                }
                ans.question_info.push(tmp2)
            }
            setContents({...contents})
            console.log(contents)
            if(contents.head.Deadline < tmpd){
                setOvertime(true)
            }
        })
    }
    // 初次渲染获得数据
    useEffect(()=>{
        getcontents()
    },[])
    // 监听滚动位置，是否显示返回顶部
    const [show, switchShow] = useState(false)
    useEffect(()=>{
        const listener = createThrottle(()=>{
        const shouldShow = window.scrollY > 300
        if (shouldShow !== show) {
            switchShow(shouldShow)
        }
        }, 500) as EventListener;
        document.addEventListener('scroll', listener)
        return ()=>document.removeEventListener('scroll', listener)
    }, [show])
    // 删除问题
    const deleteQuestion = (deleteIndex:number) => {
        contents.question.splice(deleteIndex,1)
        // 深拷贝
        // setQuestion([...question])
        setContents({...contents})
    }
    // 改变单选题选项
    const changeOp = (value:number,index:number)=>{
        let tmp = {
            Qid:ans.question_info[index].Qid,
            Qtype:'2',
            Seqnum:String(index + 1),
            Title:ans.question_info[index].Title,
            Ans:value.toString()
        }
        ans.question_info[index] = tmp
        setAns({...ans})
        // res[index] = value.toString()
        // setRes([...res])
    }
    // 改变多选题选项
    const changeOps = (arr:number[],index:number)=>{
        let tmp = {
            Qid:ans.question_info[index].Qid,
            Qtype:'3',
            Seqnum:String(index + 1),
            Title:ans.question_info[index].Title,
            Ans:arr.toString()
        }
        ans.question_info[index] = tmp
        setAns({...ans})
        // res[index] = arr.toString()
        // setRes([...res])
    }
    // 获得简答答案
    const getans = (e:any,index:number)=>{
        const text = e.target.value
        let tmp = {
            Qid:ans.question_info[index].Qid,
            Qtype:'1',
            Seqnum:String(index + 1),
            Title:ans.question_info[index].Title,
            Ans:text
        }
        ans.question_info[index] = tmp
        setAns({...ans})
        // res[index] = text
        // setRes([...res])
    }
    const [able,setAble] = useState(false)
    // 填写完成
    const finish = ()=>{
        // 获取当前时间
        const tmpd = moment().format('YYYY-MM-DD HH:mm:ss')
        ans.collection_info.id = id
        ans.collection_info.SubmitTime = tmpd
        console.log(ans)
        setAble(true)
        axios.post(`/api/collection/submit/${id}`,{data:JSON.stringify(ans)})
        .then((res)=>{
            // 依据返回的code确定三个状态
            console.log(res.data)
            const code = res.data.data.data
            if(code === 1){
                message.success("提交成功!")
                setAble(true)
            }
        })
    }
    // 返回顶部
    const gotoTop = () =>{
        document.body.scrollTop = document.documentElement.scrollTop = 0
    }
    return (
        <div>
            <div id="refuse-submit" className="refuse-submit" style={{display:overtime?'flex':'none'}}>
                <h1>该收集已经截止啦!</h1>
                <h2>如有问题请联系收集发布者哦！</h2>
                <img src="./keli.gif" alt="keli" id='keli'/>
            </div>
            <div style={{display:overtime?'none':'flex'}}>
                <div className="container_files">
                    <Form onFinish={finish} 
                        id="form" 
                        method="post"  
                        name="Form"
                        initialValues={{ remember: true }}
                    >
                        <div className="header" >
                            <Form.Item name="Title">
                                <Form.Item name="Title">
                                    <label className='header_div_label'>
                                    <img src="./title.svg" className='home' alt="title" />
                                    收集标题:
                                    </label>
                                    <input
                                        className="header_div_input collectionTitle"
                                        type="text"
                                        name="collectionTitle"
                                        maxLength={20}
                                        value={contents.head.Title}
                                        disabled={true}
                                    />
                                </Form.Item>
                            </Form.Item>
                            <Form.Item name="Collector">
                                <Form.Item name="Collector">
                                    <label className='header_div_label'>
                                        <img src="./title.svg" className='home' alt="title" />
                                        收集者:
                                    </label>
                                    <input
                                        className="header_div_input collector"
                                        type="text"
                                        name="collector"
                                        maxLength={20}
                                        value={contents.head.Collector}
                                        disabled={true}
                                    />
                                </Form.Item>
                            </Form.Item>
                            <Form.Item name="Deadline">
                                <Form.Item name="Deadline">
                                    <label className='header_div_label'>
                                        <img src="./ddl.svg" className='home' alt="ddl" />
                                        截止时间:
                                    </label>
                                    <input
                                        className="header_div_input deadline"
                                        step="1"
                                        type="datetime-local"
                                        name="deadline"
                                        value={contents.head.Deadline}
                                        disabled={true}
                                    />
                                </Form.Item>
                            </Form.Item>
                            <Form.Item name="Description">
                                <Form.Item name="Description">
                                    <textarea
                                        className="description"
                                        name="description"
                                        placeholder={contents.head.Description}
                                        disabled={true}
                                    ></textarea>
                                </Form.Item>
                            </Form.Item>
                        </div>
                        <div className='submit'>
                            {contents.question.map((item,index)=>(
                                <div>
                                    <Form.Item name={item.content.title} rules={[{required:item.require===1?true:false,message:"该题为必做题!"}]}>
                                        <Form.Item name={item.content.title} >
                                            <Question isrestart={false} finish={able} require={item.require} getreqiure={getans} res={item.id} type={2} getans={getans} getA={getans} getB={getans} getC={getans} getD={getans} changeOps={changeOps} changeOp={changeOp} getDescription={getans} getTitle={getans} deleteQuestion={deleteQuestion} key={index} index={index} content={item.content} id={item.value}></Question>                                          
                                        </Form.Item>
                                    </Form.Item>
                                    <Divider dashed={true} style={{borderTopColor:'#444545bd'}}/> 
                                </div>
                            ))
                            }
                        </div>
                        <div className='file_construct'>
                            <div>
                                <img src="./submit.svg" style={{width:'42px'}} alt="submit"  />
                                <button disabled={able?true:false} id='construct'  type="submit">提交</button>
                            </div>
                        </div>
                    </Form>
                </div>
                <div className='goTop' style={{display:show?'flex':'none'}}>
                    <Popover 
                        content={<div style={{
                        width: '100px',
                        fontSize: '14px',
                        lineHeight: '15px',
                        color: '#757575',
                        }}>点我回到顶部</div>}
                        title={null}
                        placement="rightTop"
                        trigger="hover"
                        >
                            <div className='icon' onClick={gotoTop}>
                                <img src="./Home_nav_middle.png" alt="icon"/>
                            </div>
                    </Popover>
                </div>
            </div>
        </div>
        
    )
}
export default File_submitting