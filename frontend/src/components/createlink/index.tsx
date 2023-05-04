// 此组件为显示链接组件
import { Link } from "react-router-dom"
import { RightCircleOutlined }  from '@ant-design/icons'
import { message,Divider } from 'antd'
import {FC} from "react"
import "./index.css"
import copy from 'copy-to-clipboard'
interface Props{
    type:number
    link:string
}
const Createlink:FC<Props> = (props) => {
    const title = props.type === 1?"创建成功!":"收集分享!" 
    // 复制函数，引用copy组件
    const copyUrl = ()=>{
        copy(props.link)
        message.success("复制成功!")
    }
    return (
        <div className="tab_con" style={{height:props.type===1?'100%':'350px'}}>
            <div className="item" >
                <div className="box" >
                    <Divider dashed style={{fontSize:'32px',color:'#000',letterSpacing:'3px',marginTop:'10%',borderTopColor:'#000'}} orientation="left">{title}</Divider>
                    <div className="text">
                        <div>下面是您的文件收集链接</div>
                        <div>请复制并发给文件提交者</div>
                    </div>
                    <div className="links">
                        <div>{props.link}</div>
                        <button onClick={copyUrl}>复制</button>
                    </div>
                    {props.type === 1?
                        <Link  to="/Mycollection" className="tomycollection">查看我的收集<RightCircleOutlined  style={{marginLeft:'5%'}} /></Link>
                        :
                        <></>
                    }
                </div>
            </div>
        </div>
    )
}
export default Createlink