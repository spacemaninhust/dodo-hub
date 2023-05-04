// 此页面为创建收集页面
import { FC,useState,useEffect,useReducer } from 'react'
import { Link,useNavigate,useLocation } from "react-router-dom"
import 'antd/lib/modal/style/css'
import Question from '../../components/questions'
import Createlink from '../../components/createlink'
import { createThrottle } from '../../components/help'
// 引入moment获得时间
import  moment from "moment"
// 引入拖拽组件
import {DragDropContext,Droppable,Draggable} from "react-beautiful-dnd"
import { resetServerContext } from "react-beautiful-dnd"
import { Button,Modal,Divider,Form,Popover,message} from 'antd'
import 'antd/lib/popover/style/css'
import 'antd/lib/message/style/css'
import './index.css'
import axios from 'axios'
// question列表初始值
const iniQues = [
    {
        // 简答题
        qid:"",
        id:"1",
        value:1,
        content:{
            title:"姓名",
            description:"添加问题详情描述",
            ans:[0],
            A:"",
            B:"",
            C:"",
            D:""
        },
        require:0
    },
    {
        // 简答题
        qid:"",
        id:"1",
        value:1,
        content:{
            title:"学号",
            description:"添加问题详情描述",
            ans:[0],
            A:"",
            B:"",
            C:"",
            D:""
        },
        require:0
    },
    {
        // 文件收集
        qid:"",
        id:"4",
        value:4,
        content:{
            title:"文件收集",
            description:"添加问题详情描述",
            ans:[0],
            A:"",
            B:"",
            C:"",
            D:""
        },
        require:0
    }
]
const refresh = ()=>{
    if(window.name != "noReload"){
        window.name = "noReload"
        window.location.reload()
    } else {
        window.name = ""
    }
}
const File_collecting:FC = () => {
    // 刷新页面
    useEffect(()=>{
        refresh()
    },[1])
    // react-beautiful-dnd
    resetServerContext()
    const nav = useNavigate()
    const [open, setOpen] = useState(false)
    const [question,setQuestion] = useState(iniQues)
    // 未完成输入
    const [is_finished,setFinish] = useState(false)
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
    // 显示modal
    const showModal = () =>{
        setOpen(true)
    }
    // 取消按钮，open设置为false
    const handleCancel = () => {
        setOpen(false)
    }
    // 选择后更新question列表
    const chooseQuestion = (e:number) => {
        const len = question.length + 1 + ""
        const title = e ===1?"简答题"
                     :e ===2?"单选题"
                     :e ===3?"多选题"
                     :"文件收集"
        const tmp ={
            qid:"",
            id:len,
            value:e,
            content:{
                title:title,
                description:"添加问题详情描述",
                ans:[0],
                A:"",
                B:"",
                C:"",
                D:""
            },
            require:0
        }
        question.push(tmp)
        // 深拷贝
        setQuestion([...question])
        setOpen(false)
    }
    // 删除问题
    const deleteQuestion = (deleteIndex:number) => {
        question.splice(deleteIndex,1)
        // 深拷贝
        setQuestion([...question])
    }
    // 拖拽结束函数
    const handleDragEnd = (result:any) => {
        const { source, destination } = result
        if (!destination) {
          return
        }
        // 重新渲染列表
        let arr
        arr = Array.from(question)
        const [remove] = arr.splice(source.index, 1)
        arr.splice(destination.index, 0, remove)
        setQuestion(arr)
    }
    // 获取输入的题目
    const getTitle = (e:any,index:number) => {
        const text = e.target.value
        question[index].content.title = text
        setQuestion([...question])
    }
    // 获取输入的描述，跟上面一样，为什么不复用呢？因为……tsx语法没整明白(cry……)
    const getDescription = (e:any,index:number) => {
        const text = e.target.value
        question[index].content.description = text
        setQuestion([...question])
    }
    // 改变单选题选项
    const changeOp = (value:number,index:number)=>{
        question[index].content.ans[0] = value
        setQuestion([...question])
    }
    // 改变多选题选项
    const changeOps = (arr:number[],index:number)=>{
        question[index].content.ans = arr     
        // 深拷贝
        setQuestion([...question])
    }
    // 获取A选项，跟上面一样，为什么不复用呢？因为……
    const getA = (e:any,index:number) => {
        // if(e.keyCode === 13) {
            const text = e.target.value
            question[index].content.A = text
            setQuestion([...question])
        // }

    }
    // 获取B选项，跟上面一样，为什么不复用呢？因为……
    const getB = (e:any,index:number) => {
        // if(e.keyCode === 13) {
            const text = e.target.value
            question[index].content.B = text
            setQuestion([...question])
        // }
    }
    // 获取C选项，跟上面一样，为什么不复用呢？因为……
    const getC = (e:any,index:number) => {
        // if(e.keyCode === 13) {
            const text = e.target.value
            question[index].content.C = text
            setQuestion([...question])
        // }
    }
    // 获取D选项，跟上面一样，为什么不复用呢？因为……
    const getD = (e:any,index:number) => {
        // if(e.keyCode === 13) {
            const text = e.target.value
            question[index].content.D = text
            setQuestion([...question])
        // }
    }
    // 获取是否必做
    const getrequire = (checked: boolean,index:number)=>{
        const tmp = checked === true?1:0
        question[index].require = tmp
        setQuestion([...question])
    }
    // 链接
    const [link,setLink] = useState("")
    // 填写完成
    const finish = (values: string)=>{
        // 重置下questions
        setQuestion([...iniQues])
        const tim = JSON.parse(JSON.stringify(values)).Deadline
        const tmp = moment().format('YYYY-MM-DD HH:mm:ss')
        if(tim < tmp){
            message.error('error:截止时间不应早于当前时间!')
        }
        else{
            let datas = {
                head:values,
                questions:question
            }
            // 像后端传递数据
            axios.post('/api/collection/create',{data:JSON.stringify(datas)})
            .then((res)=>{
                // 依据返回的code确定三个状态
                const code = res.data.data.data
                const link = res.data.data.link
                setLink(link)
                switch(code){
                    case 1:
                        // 弹出完成框
                        setFinish(true)
                        break;
                }
            })
        }
    }
    const set =(e:any)=>{
        if(e.keyCode === 13){
            e.preventDefault()
        }
    }
    // 关闭时返回主页
    const close = ()=>{
        setFinish(false)
        nav('/')
    }
    // 返回顶部
    const gotoTop = () =>{
        document.body.scrollTop = document.documentElement.scrollTop = 0
    }
    return (
        <div style={{display:'flex'}}>
            <div className="file_back">
                <Link to="/" className="goback">
                    <img className="home" src="./home.svg" alt="svg1" />
                    返回首页
                </Link>
            </div>
            <div className="container_file">
                <Form onFinish={finish} 
                    id="form" 
                    method="post"  
                    name="Form"
                    initialValues={{ remember: true }}
                >
                    <div className="header" >
                        <Form.Item name="Title">
                            <Form.Item name="Title">
                                <Popover 
                                    content={<div style={{
                                        width: '150px',
                                        fontSize: '14px',
                                        lineHeight: '15px',
                                        color: '#757575',
                                    }}>请填写问卷/作业标题</div>}
                                    title={null}
                                    placement="leftTop"
                                    trigger="hover"
                                >
                                    <label className='header_div_label'>
                                    <img src="./title.svg" className='home' alt="title" />
                                    收集标题:
                                    </label>
                                </Popover>
                                <input
                                    className="header_div_input collectionTitle"
                                    type="text"
                                    onKeyDown={(e)=>set(e)}
                                    name="collectionTitle"
                                    maxLength={20}
                                    required
                                />
                            </Form.Item>
                        </Form.Item>
                        <Form.Item name="Collector">
                            <Form.Item name="Collector">
                                <Popover 
                                    content={<div style={{
                                        width: '90px',
                                        fontSize: '14px',
                                        lineHeight: '15px',
                                        color: '#757575',
                                    }}>请填写收集人</div>}
                                    title={null}
                                    placement="leftTop"
                                    trigger="hover"
                                >
                                    <label className='header_div_label'>
                                        <img src="./collector.svg" className='home' alt="collector" />
                                        收集者:
                                    </label>
                                </Popover>
                                <input
                                    className="header_div_input collector"
                                    type="text"
                                    name="collector"
                                    maxLength={20}
                                    onKeyDown={(e)=>set(e)}
                                    required
                                />
                            </Form.Item>
                        </Form.Item>
                        <Form.Item name="Deadline">
                            <Form.Item name="Deadline">
                                <Popover 
                                        content={<div style={{
                                            width: '100px',
                                            fontSize: '14px',
                                            lineHeight: '15px',
                                            color: '#757575',
                                        }}>请选择截止时间</div>}
                                        title={null}
                                        placement="leftTop"
                                        trigger="hover"
                                    >
                                    <label className='header_div_label'>
                                        <img src="./ddl.svg" className='home' alt="ddl" />
                                        截止时间:
                                    </label>
                                </Popover>
                                <input
                                    className="header_div_input deadline"
                                    step="1"
                                    type="datetime-local"
                                    name="deadline"
                                    onKeyDown={(e)=>set(e)}
                                    required
                                />
                            </Form.Item>
                        </Form.Item>
                        <Form.Item name="Description">
                            <Form.Item name="Description">
                                <textarea
                                    className="description"
                                    name="description"
                                    placeholder="添加详情描述"
                                    required
                                ></textarea>
                            </Form.Item>
                        </Form.Item>
                        <span style={{textAlign:'center',display:'block'}}>注:上方问题为必填项！下方问题可拖拽排序!</span>
                    </div>
                    <div className='submit'>
                        {/* 应要求做的可拖拽，真该死啊你zjy */}
                        {/* 你坏死做尽 */}
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="droppable">
                            {(droppableProvided) => (
                                <div {...droppableProvided.droppableProps} ref={droppableProvided.innerRef}>
                                {question.map((t, i) => (
                                    <Draggable draggableId={t.id} key={t.id} index={i}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.dragHandleProps}
                                                {...provided.draggableProps}
                                            >
                                                <Question isrestart={false} finish={false} require={t.require} getreqiure={getrequire} res={t.id} getans={getA} type={1} getA={getA} getB={getB} getC={getC} getD={getD} changeOps={changeOps} changeOp={changeOp} getDescription={getDescription} getTitle={getTitle} deleteQuestion={deleteQuestion} key={i} index={i} content={t.content} id={t.value}></Question>
                                                <Divider dashed={true} style={{borderTopColor:'#444545bd'}}/>
                                            {droppableProvided.placeholder}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                
                                </div>
                            )}
                            </Droppable>
                        </DragDropContext>
                        <div onClick = {showModal} style={{cursor:'pointer',display:'flex',backgroundColor:'#e1e1e271',marginLeft:'40%',width:'fit-content',borderRadius:'10px'}}>
                            <img src="./add.svg" className='home' alt="add"  />
                            <div style={{fontSize:'16px',padding:'2px'}}>
                                添加题目
                            </div>
                        </div>
                    </div>
                    <div className='file_construct'>
                        <div>
                            <img src="./submit.svg" style={{width:'42px'}} alt="submit"  />
                            <button id='construct' >创建</button>
                        </div>
                    </div>
                </Form>
            </div>
            <div>
                {/* 添加题目 */}
                <Modal
                    title={'添加题目'}
                    open={open}
                    onCancel={handleCancel}
                    style={{textAlign:'center',marginTop:'100px'}}
                    footer={
                        <Button key = "取消" onClick={handleCancel}>取消</Button>
                    }
                >
                    <Button className='choose-question' key = "简答题" onClick={(e)=>chooseQuestion(1)}>简答题</Button>
                    <Button className='choose-question' key = "单选题" onClick={(e)=>chooseQuestion(2)}>单选题</Button>
                    <Button className='choose-question' key = "多选题" onClick={(e)=>chooseQuestion(3)}>多选题</Button>
                    <Button className='choose-question' key = "文件收集" onClick={(e)=>chooseQuestion(4)}>文件收集</Button>
                </Modal>
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
            {/* 完成弹出框 */}
            <div>
                <Modal
                    open={is_finished}
                    footer={null}
                    onCancel={close}
                >
                    <Createlink link={link} type={1}/>
                </Modal>
            </div>
            
        </div>
    )
}
export default File_collecting