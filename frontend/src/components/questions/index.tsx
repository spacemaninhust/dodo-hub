// 此组件为file_collecting中的问题组件
import { FC,useState } from 'react'
import {QuestionCircleOutlined,UploadOutlined,ExclamationCircleOutlined} from '@ant-design/icons'
import { Button,Radio,Checkbox,Col,Popover ,Upload,Modal,message,Switch } from 'antd'
import { DataType } from '../datatype'
import { useLocation } from 'react-router-dom'
import type { RadioChangeEvent } from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import type { UploadProps } from 'antd/es/upload/interface'
import type { RcFile, UploadFile } from 'antd/es/upload/interface'
import axios from 'axios'
import 'antd/lib/radio/style/css'
import 'antd/lib/checkbox/style/css'
import 'antd/lib/divider/style/css'
import 'antd/lib/popover/style/css'
import 'antd/lib/switch/style/css'
import './index.css'
// 传参
interface Props {
    id:number
    isrestart:boolean
    index:number
    res:string
    require:number
    content:DataType
    type:number
    finish:boolean
    getTitle:Function
    getDescription:Function
    changeOp:Function
    changeOps:Function
    getA:Function
    getB:Function
    getC:Function
    getD:Function
    getans:Function
    getreqiure:Function
    deleteQuestion:Function
}
// 多选框
const CheckboxGroup = Checkbox.Group
const plainOptions = ['学号', '姓名']
const Question:FC<Props> = (props) => {
    // 文件列表
    // const [fileList, setFileList] = useState<UploadFile[]>([])
    // 确定题目
    const index = props.index + 1
    const text = "Q" + index
    // 获得内容
    const content = props.content
    // 获得选择题的选项
    const op = () =>{
        return content.ans[0]
    }
    // 定义modal
    const [modal, contextHolder] = Modal.useModal()
    // showmodal函数
    // 删除问题，应弹出窗口提示,确认后删除
    const showmodal = () => {
      modal.confirm({
        title: '警告',
        icon: <ExclamationCircleOutlined />,
        content: '确认删除该问题吗',
        okText: '确认',
        cancelText: '取消',
        onOk:()=>{
            props.deleteQuestion(props.index)
        },
      })
    }
    // 获得res的多选答案
    // 多选初始化
    const [checkedList, setCheckedList] = useState(()=>{
        let arr=[]
        for(let i = 0;i < content.ans.length;i++){
            if(content.ans[i] === 1){
                arr[i]="学号"
            }else if(content.ans[i] === 2){
                arr[i]="姓名"
            }
        }
        return arr
    })
    // 设置初始全选按钮状态
    const [indeterminate, setIndeterminate] = useState(()=>{
        if(content.ans[0] === 0 || content.ans.length === 2){
            return false
        }
        return true
    })
    const [checkAll, setCheckAll] = useState(()=>{
        if(content.ans.length === 2){
            return true
        }
        return false
    })
    // 多选状态改变
    const onChange = (list: any) => {
        setCheckedList(list)
        let arr=[]
        for(let i = 0;i < list.length;i++){
            if(list[i]==="学号"){
                arr[i] = 1
            }else arr[i] = 2
        }
        props.changeOps(arr,props.index)
        setIndeterminate(!!list.length && list.length < plainOptions.length)
        setCheckAll(list.length === plainOptions.length)
    }
    const onCheckAllChange = (e: CheckboxChangeEvent) => {
        if(e.target.checked){
            setCheckedList(plainOptions)
            let arr = [1,2]
            props.changeOps(arr,props.index)
        }else{
            setCheckedList([])
            let arr = [0]
            props.changeOps(arr,props.index)
        }
        setIndeterminate(false)
        setCheckAll(e.target.checked)
    }
    // 单选使用
    const [radiovalue, setradioValue] = useState(op())
    // 正确答案
    const trueradiovalues = String.fromCharCode(radiovalue + 64)
    console.log('truevalues',trueradiovalues,radiovalue)
    // 获得提交的答案单选
    // todo
    const radiovalues = Number(props.res)
    // 获得提交的多选答案
    const [checkvalues,setcheckValues] = useState(()=>{
        // todo 获得选择的答案
        // res为String(1,2,3)
        let arr = props.res.split(',')
        return arr
    })
    // 正确的多选使用(答案)
    const [checkvalue, setcheckValue] = useState(()=>{
        if(props.id === 3){
            let arr=[]
            arr = content.ans.map(String)
            return arr
        }
    })
    // 正确的多选答案
    const [truecheckvalues,settruecheckvalues] = useState(()=>{
        let arr = []
        let res = []
        arr = content.ans.map(Number)
        for(let i = 0;i < arr.length;i++){
            res[i] = String.fromCharCode(arr[i] + 65)
        }
        return String(res)
    })
    // 多选改变
    const oncheckChange = (checkedValues: any) => {
        // 传参给父组件
        const arr = checkedValues.map(Number)
        arr.sort()
        props.changeOps(arr,props.index)
        setcheckValue(checkedValues)
    }
    // 单选改变
    const radioonChange = (e: RadioChangeEvent) => {
        props.changeOp(e.target.value,props.index)
        setradioValue(e.target.value)
    }
    const set =(e:any)=>{
        if(e.keyCode === 13){
            e.preventDefault()
        }
    }
    // 获得路由
    const location = useLocation()
    // 获得路由id
    const id = location.pathname.split('/')[2]
    const prop: UploadProps = {
        name: 'file',
        action: `/api/collection/submit/${id}/${props.index+1}`,
        maxCount:1,
        headers: {
          authorization: 'authorization-text',
        },
        onChange(info) {
          if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
          } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
          }
        },
        onRemove(file){
            axios.post(`/api/collection/submit/${id}/${props.index+1}/${file.name}`,{data:JSON.stringify(file.name)}).then((res)=>{
                console.log(1)
            })
            
        }
    }
    return(
        <div className='questions'>
            <div className='Nameid'>
                <h1>
                    {
                        props.type === 1?
                        <div>
                            <span style={{fontSize:'15px'}}>{text}</span>
                            <input 
                                onChange={e =>props.getTitle(e,props.index)}
                                className="input-topic" 
                                type="text" 
                                onKeyDown={(e)=>set(e)}
                                key={'title'}
                                name="question_name"
                                disabled={props.isrestart}
                                placeholder={content.title}
                            />
                            <input style={{display:'none'}} />
                            <Switch disabled={props.isrestart} onChange={e=>props.getreqiure(e,props.index)} style={{marginLeft:'40%',marginTop:'10px'}} checkedChildren="必做" unCheckedChildren="非必做" defaultChecked={props.require === 1?true:false} />
                        </div>
                        :
                        <div className="input-topic" >
                            {
                                props.require === 1?
                                <Popover 
                                    content={<div style={{
                                        width: '90px',
                                        fontSize: '14px',
                                        lineHeight: '15px',
                                        color: '#757575',
                                    }}>该题为必做题</div>}
                                    title={null}
                                    placement="leftTop"
                                    trigger="hover"
                                >
                                    <span style={{color:'red',fontSize:'20px'}}>*</span>
                                </Popover>
                                :
                                <></>
                            }
                            <span style={{fontSize:'15px'}}>{text}</span>
                            {content.title}
                        </div>
                    }
                </h1>
                {
                    props.type === 1?
                    <textarea
                        className="description-name"
                        name="description"
                        placeholder={content.description}
                        onChange={e =>props.getDescription(e,props.index)}
                        disabled={props.isrestart}
                    ></textarea>
                    :
                    <div
                        className="description-name"
                    >
                        {content.description}
                    </div>
                }
                {
                    // 简答题
                    props.id ===1?
                    <input
                        className="description-name"
                        type="text"
                        onChange={e =>props.getans(e,props.index)}
                        onKeyDown={(e)=>set(e)}
                        disabled={props.type===2&&props.finish===false?false:true}
                        defaultValue={props.type===3?props.res:""}
                        key="res"
                        placeholder={props.type===1?"注:此项由提交者填写":props.type===2?"请作答":""}
                    />
                    :props.id===2?
                    // 单选题
                    <div className='chooses'>
                        <Radio.Group  disabled={props.type===3||props.finish===true||props.isrestart===true?true:false} style={{display:'grid'}} onChange={radioonChange} defaultValue={props.type===3?radiovalues:radiovalue}>
                            <Radio value={1} >
                                A
                                <input type="text" className="input-topic ans" 
                                onChange={e =>props.getA(e,props.index)}
                                onKeyDown={(e)=>set(e)}
                                defaultValue={content.A}
                                disabled={props.type===1?false:true}
                                />
                            </Radio>
                            <Radio value={2} >
                                B
                                <input type="text" className="input-topic ans" 
                                    onChange={e =>props.getB(e,props.index)}
                                    // onKeyUp={e =>props.getB(e,props.index)}
                                    onKeyDown={(e)=>set(e)}
                                    defaultValue={content.B}    
                                    disabled={props.type===1?false:true}
                                />
                            </Radio>
                            <Radio value={3}>
                                C
                                <input type="text" className="input-topic ans" 
                                    onChange={e =>props.getC(e,props.index)}
                                    // onKeyUp={e =>props.getC(e,props.index)}
                                    onKeyDown={(e)=>set(e)}
                                    defaultValue={content.C} 
                                    disabled={props.type===1?false:true}   
                                />
                            </Radio>
                            <Radio value={4} >
                                D
                                <input type="text" className="input-topic ans" 
                                    onChange={e =>props.getD(e,props.index)}
                                    // onKeyUp={e =>props.getD(e,props.index)}
                                    onKeyDown={(e)=>set(e)}
                                    defaultValue={content.D}
                                    disabled={props.type===1?false:true}
                                />
                            </Radio>
                        </Radio.Group>
                        <div style={{display:props.type===3?'flex':'none'}}>
                            正确答案:
                            {trueradiovalues}
                        </div>
                    </div>
                    :props.id===3?
                    // 多选题
                    <div className='choose'>
                        <Checkbox.Group  disabled={props.type===3||props.finish===true||props.isrestart===true?true:false} style={{ width: '100%'}} defaultValue={props.type===3?checkvalues:checkvalue}  onChange={oncheckChange}>
                            {/* <Row> */}
                            <Col span={8}>
                                <Checkbox value="1">
                                    A
                                    <input type="text" className="input-topic ans" 
                                        onChange={e =>props.getA(e,props.index)}
                                        onKeyDown={(e)=>set(e)}
                                        defaultValue={content.A}
                                        disabled={props.type===1?false:true}
                                    />
                                </Checkbox>
                            </Col>
                            <Col span={8}>
                                <Checkbox value="2" >
                                    B
                                    <input type="text" className="input-topic ans" 
                                        onChange={e =>props.getB(e,props.index)}
                                        // onKeyUp={e =>props.getB(e,props.index)}
                                        onKeyDown={(e)=>set(e)}
                                        defaultValue={content.B}
                                        disabled={props.type===1?false:true}
                                    />
                                </Checkbox>
                            </Col>
                            <Col span={8}>
                                <Checkbox value="3" >
                                    C
                                    <input type="text" className="input-topic ans" 
                                        onChange={e =>props.getC(e,props.index)}
                                        // onKeyUp={e =>props.getC(e,props.index)}
                                        onKeyDown={(e)=>set(e)}
                                        defaultValue={content.C}
                                        disabled={props.type===1?false:true}
                                    />
                                </Checkbox>
                            </Col>
                            <Col span={8}>
                                <Checkbox value="4" >
                                    D
                                    <input type="text" className="input-topic ans" 
                                        onChange={e =>props.getD(e,props.index)}
                                        // onKeyUp={e =>props.getD(e,props.index)}
                                        onKeyDown={(e)=>set(e)}
                                        defaultValue={content.D}
                                        disabled={props.type===1?false:true}
                                    />
                                </Checkbox>
                            </Col>
                            {/* </Row> */}
                        </Checkbox.Group>
                        <div style={{display:props.type===3?'flex':'none'}}>
                            正确答案:
                            {truecheckvalues}
                        </div>
                    </div>
                    :
                    // 文件
                    <div>
                        <div className='rule'>
                            <Popover 
                                content={<div style={{
                                    width: '170px',
                                    fontSize: '14px',
                                    lineHeight: '15px',
                                    color: '#757575',

                                }}>根据选项对文件进行重命名</div>}
                                title={null}
                                placement="rightTop"
                                trigger="hover"
                            >
                                <span>重命名规则选择</span>
                                <QuestionCircleOutlined style={{marginLeft:'10px', fontSize: '14px'}} />
                            </Popover>
                        </div>    
                        <div className='option'>
                            <CheckboxGroup disabled={props.type === 1 && props.isrestart === false?false:true} options={plainOptions} value={checkedList} onChange={onChange} />
                            <Checkbox disabled={props.type === 1&& props.isrestart === false?false:true} indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
                                全选
                            </Checkbox>
                        </div>
                        <div className='option'>
                            <Upload {...prop} disabled={props.type === 2&&props.finish===false?false:true}>
                                <Button disabled={props.type === 2&&props.finish===false?false:true} id='upload' icon={<UploadOutlined />}>点击上传文件(由填写者上传)</Button>
                            </Upload>
                        </div>
                    </div>
                }
                {
                    props.type === 1?
                    <div className='deleteques'>
                        <img style={{width:'20px',paddingBottom:'3px'}} src="./delete.svg" alt="delete"  />
                        <Button onClick={showmodal} id="removeTopic">删除题目</Button>
                    </div>
                    :<></>
                }
                {/* 提示是否删除 */}
                {contextHolder}
            </div>
        </div>
    ) 
}
export default Question
