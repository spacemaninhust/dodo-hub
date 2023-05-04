// 此组件为收集记录组件
import { FC,useState } from 'react'
import { useNavigate } from "react-router-dom"
import './index.css'
// icon
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Modal, message } from 'antd'
import Createlink from '../createlink'
import axios from 'axios'
// 传参
interface Props {
    id:number
    index:number
    title:string
    collector:string
    deadline:string
    status:number
    number:number
    link:string
    deleteCollections :Function
}
const Collections:FC<Props> = (props) => {
    const nav = useNavigate()
    // 定义modal
    const [modal, contextHolder] = Modal.useModal()
    // showmodal函数
    // 删除问题，应弹出窗口提示,确认后删除
    const showmodal = () => {
        modal.confirm({
            title: '警告',
            icon: <ExclamationCircleOutlined />,
            content: '确认删除该记录吗',
            okText: '确认',
            cancelText: '取消',
            onOk:()=>{
                // 在浏览器删除，并且要在后端也删除
                props.deleteCollections(props.index)
                // todo……后端删除该记录
                axios.post(`/api/collection/delete/${props.id}`,{data:JSON.stringify("zhoufu")})
                .then((res)=>{
                    message.success("删除成功!")
                })
            },
        })
    }
    const [is_shared,setShared] = useState(false)
    // 分享函数
    const share = ()=>{
        // 弹出分享框，creatlink组件
        setShared(true)
    }
    // 复制函数
    const Copy = ()=>{
        // 跳转到该页面后，数据如何处理呢？
        // 本来是页面，如果传参太乱，不如就跳转后再获取数据渲染
        // 如何获取数据，依据用户以及该问题index可以查询到数据然后获取
        // 这样不需要传递所有参数，但是也需要传递index
        // 使用nav传参即可，传递一个index
        nav('/File_copy',{state:{data:props.id}})
    }
    // 编辑函数
    const Edit = ()=>{
        // 跳转到该页面后，数据如何处理呢？
        // 本来是页面，如果传参太乱，不如就跳转后再获取数据渲染
        // 如何获取数据，依据用户以及该问题index可以查询到数据然后获取
        // 这样不需要传递所有参数，但是也需要传递index
        // 使用nav传参即可，传递一个index
        nav('/File_edit',{state:{data:props.id}})
    }
    // 重启函数
    const Restart = ()=>{
        // 跳转到该页面后，数据如何处理呢？
        // 本来是页面，如果传参太乱，不如就跳转后再获取数据渲染
        // 如何获取数据，依据用户以及该问题index可以查询到数据然后获取
        // 这样不需要传递所有参数，但是也需要传递index
        // 使用nav传参即可，传递一个index
        nav('/File_restart',{state:{data:props.id}})
    }
    // 统计函数
    const details = ()=>{
        nav('/CollectionDetails',{state:{data:props.id}})
    }
    return (
        <div className='card'>
            <div className='cardHead'>
                <div className='cardItems cardTitleBox'>
                    <div className='itemTitles cardTitle'>
                        <img src="./title.svg" className='coll' alt="title" />
                        收集标题
                    </div>
                    <div className="member_title" style={{color:'grey'}}>
                        {props.title}
                    </div>
                </div>
                <div className='cardItems cardNameBox'>
                    <div className="itemTitles cardName">
                        <img src="./collector.svg" className='coll' alt="title" />
                        收集者
                    </div>
                    <div className="member_name"  style={{color:'grey'}}>
                        {props.collector}
                    </div>
                </div>
                <div className='cardItems cardDateBox'>
                    <div className="itemTitles cardDate">
                        <img src="./ddl.svg" className='coll' alt="ddl" />
                        截止时间
                    </div>
                    <div className="member_date" style={{color:'grey'}}>
                        {props.deadline}
                    </div>
                </div>
            </div>
            <div className='cardBody'>
                <div className="cardItems cardConditionBox">
                    <div className="itemTitles cardCondition">
                        <img src="./status.svg" className='coll' alt="status" />
                        收集状态
                    </div>
                    <div className="member_condition" >
                        {props.status === 1 ?
                        <div style={{color:'green'}}>
                            进行中
                        </div>
                        :
                        <div>
                            已截止
                        </div>
                        }
                    </div>
                </div>
                <div className="cardItems cardTimesBox">
                    <div className="itemTitles cardTimes">
                        <img src="./num.svg" className='coll' alt="num" />
                        提交次数
                    </div>
                    <div className="member_times" >
                        {props.number}份
                    </div>
                </div>
                <div className="cardItems cardOperateBox">
                    <div className="member_operate">
                        <div className="operate" onClick={share}>分享</div>
                        <div className="operate" onClick={details}>统计</div>
                        {
                            props.status === 1?
                            <div className="operate" onClick={Edit}>编辑</div>
                            :
                            <div className="operate" onClick={Restart}>重启</div>
                        }
                        <div className="operate" onClick={Copy}>复制</div>
                        {/* 点击删除弹出确认框 */}
                        <div className="operate" onClick={showmodal}>删除</div>
                        {/* 提示是否删除 */}
                        {contextHolder}
                    </div>
                </div>
            </div>
            {/* 显示分享链接 */}
            <div>
                <Modal
                    open={is_shared}
                    footer={null}
                    closable={false}
                >
                    <Createlink link={props.link} type={2}/>
                    <button className='ok' onClick={()=>{setShared(false)}}>确定</button>
                </Modal>
            </div>
        </div>
    )
}
export default Collections