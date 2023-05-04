// 此页面为创建收集页面
import { FC,useState,useEffect } from 'react'
import 'antd/lib/modal/style/css'
import Question from '../../components/questions'
import { createThrottle } from '../../components/help'
import { useLocation } from 'react-router-dom'
// 引入moment获得时间
import { Divider,Form,Popover} from 'antd'
import { DataTypess } from '../../components/datatype'
import { Restype } from '../../components/datatype'
import 'antd/lib/popover/style/css'
import 'antd/lib/message/style/css'
import axios from 'axios'
// question列表初始值
const iniQues :DataTypess[] = []
// const inires: Restype[] = []
const inihead = {
    Title:"",
    Collector:"",
    Deadline:"",
    Description:""
}
const inicontents = {
    head:inihead,
    questions:iniQues
}
const File_preview:FC = () => {
    // 获得id
    const location = useLocation()
    const id = location.state.data
    // 定义大数据结构
    const [contents,setContents] = useState(inicontents)
    // 获取数据
    const getdata = ()=>{
        axios.get(`/api/filepreview/preview/${id}`)
        .then((res)=>{
            console.log(res.data.data)
            const tmp = res.data.data
            const tmphead = tmp.collection_info
            console.log(tmphead)
            // 设置头
            contents.head.Title = String(tmphead.Title)
            contents.head.Collector = String(tmphead.Collector)
            contents.head.Deadline = String(tmphead.Deadline)
            contents.head.Description = String(tmphead.Description)
            // 设置问题
            const tmpques = tmp.questions_info
            // 设置答案
            const tmpres = tmp.answers_info
            console.log(tmpques)
            console.log(tmpres)
            for(let i = 0;i < tmpques.length;i++){
                let tmps:DataTypess = {
                    qid:String(tmpques[i].Qid),
                    id:String(tmpques[i].Seqnum),
                    value:Number(tmpques[i].Qtype),
                    content:{
                        title:String(tmpques[i].Title),
                        description:String(tmpques[i].Description),
                        // 正确答案放在这里!
                        ans:String(tmpques[i].Ans).split(',').map(Number),
                        A:String(tmpques[i].Options.A),
                        B:String(tmpques[i].Options.B),
                        C:String(tmpques[i].Options.C),
                        D:String(tmpques[i].Options.D)
                    },
                    require:Number(tmpques[i].Require),
                    // 在这里设置提交的答案，方便后续遍历
                    ans:String(tmpres[i].Result)
                }
                contents.questions.push(tmps)
            }
            // 设置完毕，更新
            setContents({...contents})
            console.log(contents)
        })
    }
    useEffect(()=>{
        getdata()
    },[])
    // 获取头部
    // const head = inihead
    const [question,setQuestion] = useState(iniQues)
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
        question.splice(deleteIndex,1)
        // 深拷贝
        setQuestion([...question])
    }
    // 改变单选题选项
    const changeOp = (value:number,index:number)=>{
        console.log(value)
    }
    // 改变多选题选项
    const changeOps = (arr:number[],index:number)=>{
        console.log(arr)
    }
    // 获得简答答案
    const getans = (e:any)=>{
        console.log(1)
    }
    // 返回顶部
    const gotoTop = () =>{
        document.body.scrollTop = document.documentElement.scrollTop = 0
    }
    return (
        <div>
            <div style={{display:'flex'}}>
                <div className="container_files">
                    <Form 
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
                            {contents.questions.map((item,index)=>(
                                <div>
                                    <Question isrestart={false} finish={false} require={0} getreqiure={getans} type={3} getans={getans} getA={getans} getB={getans} getC={getans} getD={getans} changeOps={changeOps} changeOp={changeOp} getDescription={getans} getTitle={getans} deleteQuestion={deleteQuestion} key={index} index={index} res={item.ans}  content={item.content} id={item.value}></Question>
                                    <Divider dashed={true} style={{borderTopColor:'#444545bd'}}/>
                                </div>
                            ))
                            }
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
export default File_preview