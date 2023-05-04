// 此页面为创建收集页面
import { FC,useState,useEffect } from 'react'
import 'antd/lib/modal/style/css'
import { useLocation, useNavigate } from 'react-router-dom'
import Question from '../../components/questions'
// 引入拖拽组件
import {DragDropContext,Droppable,Draggable} from "react-beautiful-dnd"
import { resetServerContext } from "react-beautiful-dnd"
import { createThrottle } from '../../components/help'
import { DataTypes } from '../../components/datatype'
// import { Restype } from '../../components/datatype'
// 引入moment获得时间
import  moment from "moment"
import { Divider,Form,Popover,message,Modal,Button } from 'antd'
import 'antd/lib/popover/style/css'
import 'antd/lib/message/style/css'
import axios from 'axios'
// question列表初始值
const inihead = {
    Title:"",
    Collector:"",
    Deadline:"",
    Description:""
}
const iniQuess: DataTypes[] = []
const inicontent = {
    head:inihead,
    questions:iniQuess
}
// const refresh = ()=>{
//     if(window.name != "noReload"){
//         window.name = "noReload"
//         window.location.reload()
//     } else {
//         window.name = ""
//     }
// }
const File_edit:FC = () => {
    // react-beautiful-dnd
    resetServerContext()
    // 刷新页面
    // useEffect(()=>{
    //     refresh()
    // },[1])
    // 答案
    // const [ans,setAns] = useState(ress)
    const nav = useNavigate()
    // 获取头部
    const [contents,setContents] = useState(inicontent)
    const location = useLocation()
    const id = location.state.data
    const getcontents = ()=>{
        axios.get(`/api/collection/edit/${id}`)
        .then((res)=>{
            // 获得头以及问题
            const tmp = res.data.data
            // 问题头部
            console.log(tmp)
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
                        ans:ques[i].Ans.map(Number),
                        A:String(ques[i].Options.A),
                        B:String(ques[i].Options.B),
                        C:String(ques[i].Options.C),
                        D:String(ques[i].Options.D)
                    },
                    require:Number(ques[i].Require)
                }
                contents.questions[i] = tmp
            }
            setContents({...contents})
        })
    }
    // 初次渲染获得数据
    useEffect(()=>{
        getcontents()
    },[])
    // 拖拽结束函数
    const handleDragEnd = (result:any) => {
        const { source, destination } = result
        if (!destination) {
            return
        }
        // 重新渲染列表
        let arr
        arr = Array.from(contents.questions)
        const [remove] = arr.splice(source.index, 1)
        arr.splice(destination.index, 0, remove)
        contents.questions = arr
        setContents({...contents})
    }
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
        contents.questions.splice(deleteIndex,1)
        // 深拷贝
        // setQuestion([...question])
        setContents({...contents})
    }
    // 填写完成
    const finish = (values: string)=>{
        const tim = JSON.parse(JSON.stringify(values)).Deadline
        const tmp = moment().format('YYYY-MM-DD HH:mm:ss')
        if(tim < tmp){
            message.error('error:截止时间不应早于当前时间!')
        }
        // 修改头部
        else{
            contents.head.Title = JSON.parse(JSON.stringify(values)).Title===undefined?contents.head.Title:JSON.parse(JSON.stringify(values)).Title
            contents.head.Collector = JSON.parse(JSON.stringify(values)).Collector===undefined?contents.head.Collector:JSON.parse(JSON.stringify(values)).Collector
            contents.head.Deadline = JSON.parse(JSON.stringify(values)).Deadline===undefined?contents.head.Deadline:JSON.parse(JSON.stringify(values)).Deadline
            contents.head.Description = JSON.parse(JSON.stringify(values)).Description===undefined?contents.head.Description:JSON.parse(JSON.stringify(values)).Description
            console.log(contents)
            axios.post(`/api/collection/edit/${id}`,{data:JSON.stringify(contents)})
            .then((res)=>{
                // 依据返回的code确定三个状态
                const code = res.data.data.data
                if(code === 1){
                    message.success("编辑完成!")
                    nav('/')
                }
            })
        }
        
    }
    // 获取是否必做
    const getrequire = (checked: boolean,index:number)=>{
        // console.log(checked)
        const tmp = checked === true?1:0
        contents.questions[index].require = tmp
        setContents({...contents})
    }
        // 获取输入的题目
    const getTitle = (e:any,index:number) => {
        const text = e.target.value
        contents.questions[index].content.title = text
        setContents({...contents})
    }
    // 获取输入的描述，跟上面一样，为什么不复用呢？因为……tsx语法没整明白(cry……)
    const getDescription = (e:any,index:number) => {
        const text = e.target.value
        contents.questions[index].content.description = text
        setContents({...contents})
    }
    // 改变单选题选项
    const changeOp = (value:number,index:number)=>{
        contents.questions[index].content.ans[0] = value
        setContents({...contents})
    }
    // 改变多选题选项
    const changeOps = (arr:number[],index:number)=>{
        contents.questions[index].content.ans = arr     
        // 深拷贝
        setContents({...contents})
    }
    // 获取A选项，跟上面一样，为什么不复用呢？因为……
    const getA = (e:any,index:number) => {
        // if(e.keyCode === 13) {
            const text = e.target.value
            contents.questions[index].content.A = text
            setContents({...contents})
        // }

    }
    // 获取B选项，跟上面一样，为什么不复用呢？因为……
    const getB = (e:any,index:number) => {
        // if(e.keyCode === 13) {
            const text = e.target.value
            contents.questions[index].content.B = text
            setContents({...contents})
        // }
    }
    // 获取C选项，跟上面一样，为什么不复用呢？因为……
    const getC = (e:any,index:number) => {
        // if(e.keyCode === 13) {
            const text = e.target.value
            contents.questions[index].content.C = text
            setContents({...contents})
        // }
    }
    // 获取D选项，跟上面一样，为什么不复用呢？因为……
    const getD = (e:any,index:number) => {
        // if(e.keyCode === 13) {
            const text = e.target.value
            contents.questions[index].content.D = text
            setContents({...contents})
        // }
    }
    // 返回顶部
    const gotoTop = () =>{
        document.body.scrollTop = document.documentElement.scrollTop = 0
    }
    const set =(e:any)=>{
        if(e.keyCode === 13){
            e.preventDefault()
        }
    }
    const [open,setOpen] = useState(false)
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
        const len = contents.questions.length + 1 + ""
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
        contents.questions.push(tmp)
        // 深拷贝
        setContents({...contents})
        setOpen(false)
    }
    // const [is_finished,setFinish] = useState(false)
    return (
        <div>
            <div style={{display:'flex'}}>
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
                                        defaultValue={contents.head.Title}
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
                                        defaultValue={contents.head.Collector}
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
                                        defaultValue={contents.head.Deadline}
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
                                        defaultValue={contents.head.Description}
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
                                    {contents.questions.map((t, i) => (
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
                                <button id='construct' >完成</button>
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
            </div>
            {/* <div>
                <Modal
                    open={is_finished}
                    footer={null}
                    onCancel={close}
                >
                    <Createlink link={link} type={1}/>
                </Modal>
            </div> */}
        </div>
        
    )
}
export default File_edit