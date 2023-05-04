// 此页面为收集详细信息页面
import { FC, useState,useEffect } from "react"
import { Link,useLocation, useNavigate, useNavigation } from "react-router-dom"
import {ExclamationCircleOutlined} from '@ant-design/icons'
import { List, Skeleton,Modal,message,Table,Tabs,Popover,Collapse, Divider } from 'antd'
import moment from "moment"
import useCountdown from "../../components/useCountdown"
import type { ColumnsType } from 'antd/es/table'
//导入柱形图
import * as echarts from 'echarts'
import 'echarts/lib/chart/bar'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/markPoint'
import ReactEcharts from 'echarts-for-react'
import 'antd/lib/list/style/css'
import 'antd/lib/skeleton/style/css'
import 'antd/lib/table/style/css'
import 'antd/lib/tabs/style/css'
import 'antd/lib/collapse/style/css'
import './index.css'
import axios from "axios"
const { Panel } = Collapse
interface fileList{
    type:string,
    name:string,
    url:string,
    id:string,
    scid:string
}
interface NameList {
    id:string,
    key: string;
    time: string;
    num: string;
    file:fileList[]
}
interface name{
    name:string,
    email:string
}
const inicollections:NameList[] = []
const inidata = {
    quescount:"",
    filecount:"",
    ddl:"",
    title:""
}
// 定义正确率类型
const iniacc:number[] = []
const iniseqnum:number[] = []
const ininamelist:name[] = []
// 定义每道题类型
interface quessacc{
    name:string,
    value:number
}
interface quesacc{
    acc:quessacc[],
    ans:string,
    namelist:string[]
}
const tmp:quessacc[] = []
const iniqueacc:quesacc[] = []
const inicontents = {
    acc:iniacc,
    seqnum:iniseqnum,
    queacc:iniqueacc
}
const CollectionDetails:FC = ()=>{
    const nav = useNavigate()
    // 获得id
    const location = useLocation()
    // const id = location.state.data
    const id = 1
    // 页面头部
    const [headdata,setHeaddata] = useState(inidata)
    // 依据ddl计算截止时间
    // todo 不够丝滑
    const { day, hour, minute, second } = useCountdown({
        deadline: headdata.ddl
        // 2023-04-28 20:46:07
    })
    // 获得头部数据
    const getdata = ()=>{
        axios.get(`/api/admin/statistics/${id}`)
        .then((res)=>{
            // todo,处理数据
            // 转为对象
            const tmp = JSON.parse(res.data.data.data)
            // 赋值
            headdata.quescount = String(tmp.Submissioncount)
            headdata.filecount = String(tmp.Filecount)
            headdata.ddl = String(tmp.Deadline)
            headdata.title = String(tmp.Title)
            // todo
            // headdata.xsl = 
            // headdata.rar = 
            setHeaddata({...headdata})
        })
    }
    useEffect(()=>{
        getdata()
    },[])
    // 获得当前时间
    const time = moment().format('YYYY-MM-DD HH:mm:ss')
    // 姓名列表
    const [nameList,setNameList] = useState(ininamelist)
    // 获得初始名单
    const getnamelist = ()=>{
        axios.get(`/api/admin/namelist/${id}`)
        .then((res)=>{
            // todo 处理数据
            console.log(res.data.data.data)
            const tmp = res.data.data.data
            for(let i = 0;i < tmp.length;i++){
                // console.log(tmp[i])
                // 传递email后的处理
                let tmps = {
                    name:tmp[i].Name,
                    email:tmp.Email
                }
                nameList[i] = tmps
            }
            setNameList([...nameList])
            // console.log(nameList)
        })
    }
    useEffect(()=>{
        getnamelist()
    },[])
    // 导航条
    const [ischoose1,setIschoose1] = useState(true)
    const [ischoose2,setIschoose2] = useState(false)
    const [ischoose3,setIschoose3] = useState(false)
    const choose = (index:number)=>{
        if(index === 1){
            setIschoose1(true)
            getnamelist()
            setIschoose2(false)
            setIschoose3(false)
        }else if(index === 2){
            setIschoose1(false)
            setIschoose2(true)
            getsubmission()
            setIschoose3(false)
        }else{
            setIschoose1(false)
            setIschoose2(false)
            setIschoose3(true)
            getgraphic()
        }
    }
    // 删除姓名
    // 弹出提示框
    // 定义modal
    const [modal, contextHolder] = Modal.useModal()
    // showmodal函数
    // 删除名单，应弹出窗口提示,确认后删除
    const showmodal = (index:number) => {
        modal.confirm({
          title: '警告',
          icon: <ExclamationCircleOutlined />,
          content: '确认删除该成员吗',
          okText: '确认',
          cancelText: '取消',
          onOk:()=>{
              const data = nameList[index].name
              //向后端传递数据
              axios.post(`/api/admin/delete_name/${id}`,{data:JSON.stringify(data)})
              .then((res)=>{
                // todo状态返回
                const code = res.data.data.data
                if(code === 1){
                    deletename(index)
                    message.success("删除成功!")
                }
              })   
          },
        })
    }
    const deletename = (index:number)=>{
        nameList.splice(index,1)
        // 深拷贝
        setNameList([...nameList])
    }
    // 添加姓名
    const [is_add,setIsadd] = useState(false)
    const [names,setNames] = useState("")
    // 获取textarea的值
    const getname = (e:any)=>{
        const text = e.target.value
        setNames(text)
    }
    const addName = ()=>{
        // 首先解析出姓名
        // 按行分隔
        let code = names.split(/[(\r\n)\r\n]+/); // 根据换行或者回车进行识别
        code.forEach((item:any, index:number) => { // 删除空项
        if (!item) {
            code.splice(index, 1);
            }
        })
        code = Array.from(new Set(code)); // 去重
        // 再将code按","分隔
        // 遍历code所有数据
        const data = []
        for(let i = 0;i < code.length;i++){
            let result = code[i].split(",")
            // 对于每一个result的值,将其值加入到nameList中
            for(let j = 0;j < result.length;j++){
                const tmp = {
                    name:result[j]
                }
                data.push(tmp)
            }    
        }
        // 向后端传递数据并获取数据
        axios.post(`/api/admin/namelist/${id}`,{data:JSON.stringify(data)})
        .then((res)=>{
            // toto 处理数据
            // 后端传递数据类似首次获取姓名
            const tmp = res.data.data.data
            console.log(tmp)
            for(let i = 0;i < tmp.length;i++){
                // 传递email后的处理
                let tmps = {
                    name:tmp[i].Name,
                    email:tmp.Email
                }
                nameList[i] = tmps
            }
            console.log(nameList)
            setNameList([...nameList])
            message.success("添加成功!")
        })
        // 深拷贝,重新渲染nameList
        // setNameList([...nameList])
        // 关闭弹窗
        setIsadd(false)
        // 清空textarea值
        setNames("")
    }
    // 催收
    const [messageApi, contextHolders] = message.useMessage()
    const sendemail = ()=>{
        // todo 向后端发送数据
        axios.post(`/api/admin/urging/${id}`)
        .then((res)=>{
            if(res.data.data.data === 1){
                messageApi
                .open({
                    type: 'loading',
                    content: '催交中..',
                    duration: 1,
                })
                .then(() => message.success('催交成功', 1))
            }
        })
        // messageApi
        // .open({
        //     type: 'loading',
        //     content: '催交中..',
        //     duration: 1.5,
        // })
        // .then(() => message.success('催交成功', 1.5))
    }
    // 定义预览函数
    const preview = (id:string)=>{
        nav('/File_preview',{state:{data:id}})
    }
    const columns: ColumnsType<NameList> = [
        {
        title: '序号',
        dataIndex: 'key',
        key: 'index',
        },
        {
        title: '提交时间',
        dataIndex: 'time',
        key: 'time',
        render: (text) => <div>{text}</div>,
        },
        {
        title: '文件数量',
        dataIndex: 'num',
        key: 'num',
        },
        {
        title: '文件详情',
        key: 'file',
        dataIndex:'file',
        render: (_, record) => (
            <div>
                <Collapse defaultActiveKey={['0']}  onChange={(e)=>console.log(1)}>
                    <Panel header="查看" key="1">
                        <div>{record.file.map((item, index) => (
                            <div>
                                {item.type==='doc'||item.type==='ppt'||item.type==='xls'||item.type==='docx'||item.type==='pptx'||item.type==='xlsx'?
                                // 支持的预览
                                <a href={item.url}>{item.name}</a>
                                :
                                // todo 不支持发送get请求
                                <div style={{color:'#4c9bf0',cursor:'pointer'}} onClick={()=>getfile(item.name,item.id,item.scid)}>{item.name}</div>
                                }
                            </div>
                        ))}</div>
                    </Panel>
                </Collapse>
            </div>
        ),
        },
        {
        title: '提交详情',
        key: 'action2',
        render: (_, record) => (
            <div className="preview" onClick={(e)=>preview(record.id)}>查看</div>
        ),
        }
    ]
    // 获得不可预览文件
    const getfile = (name:string,sid:string,scid:string)=>{
        // 发送请求
        fetch(`/api/admin/preview/${name}/${sid}/${scid}`)
        // .then((res)=>{
        .then(response => response.blob())
        .then(pdfBlob => {
            console.log('hust zhoufu!')
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');
        })
        .catch(error => console.error(error));
        console.log('hust zhoufu!')
        // })
    }
    // 获得汇总文件
    const getxls = ()=>{
        // 后端发送file
        axios.get(`/api/admin/get_csv/${id}`)
        .then((res)=>{
            const blob = new Blob([res.data])
            const link = document.createElement('a')
            link.download = headdata.title + '.xlsx' // a标签添加属性
            link.style.display = 'none'
            link.href = URL.createObjectURL(blob)
            document.body.appendChild(link)
            link.click() // 执行下载
            URL.revokeObjectURL(link.href)  // 释放 bolb 对象
            document.body.removeChild(link) // 下载完成移除元素
            console.log('hust zhangjunyi')
        })
    }
    // 获得汇总压缩包
    const getrar = ()=>{
        // 后端发送file
        axios.get(`/api/admin/get_zip/${id}`)
        .then((res)=>{
            const blob = new Blob([res.data])
            const link = document.createElement('a')
            link.download = headdata.title + '.zip' // a标签添加属性
            link.style.display = 'none'
            link.href = URL.createObjectURL(blob)
            document.body.appendChild(link)
            link.click() // 执行下载
            URL.revokeObjectURL(link.href)  // 释放 bolb 对象
            document.body.removeChild(link) // 下载完成移除元素
            console.log('hust zhangmiaosong')
        })
    }
    // 提交记录
    const [collections,setCollections] = useState(inicollections)
    const [contents,setContents] = useState(inicontents)
    // 获得提交记录
    const getsubmission = ()=>{
        axios.get(`/api/admin/submissions/${id}`)
        .then((res)=>{
            // 处理数据
            console.log(res.data.data.data)
            const tmp = res.data.data.data
            for(let i = 0;i < tmp.length;i++){
                let filess:fileList[] = []
                let sid = tmp[i].Sid
                const tmpfile = tmp[i].Filedetails
                console.log(tmpfile)
                for(let j = 0;j < tmpfile.length;j++){
                    let tmpss = {
                        id:sid,
                        name:tmpfile[j].Name,
                        type:tmpfile[j].Type,
                        url:"https://view.officeapps.live.com/op/view.aspx?src=" + tmpfile[j].Url,
                        scid:tmpfile[j].SCid
                    }
                    filess[j] = tmpss
                }
                let tmps = {
                    key:String(i + 1),
                    time:tmp[i].Submittime,
                    num:tmp[i].Filecount,
                    // toto 获得files
                    file:filess,
                    id:tmp[i].Sid
                }
                console.log(tmps)
                collections[i] = tmps
            }
            setCollections([...collections])
            console.log(collections)
        })
    }
    // 从后端得到数据，狗日的，想要两个，他一次全来了……
    const getgraphic = async()=>{
        await axios.get(`/api/admin/graphic/${id}`)
        .then((res)=>{
            // todo 处理数据
            console.log(res.data.data)
            const tmp = res.data.data
            // 获得所有正确率
            const tmpacc = tmp.Totalstatistics
            for(let i = 0;i < tmpacc.length;i++){
                contents.acc[i] = tmpacc[i].Accuracy
                contents.seqnum[i] = tmpacc[i].Seqnum
            }
            // 获得每道题的正确率以及答案
            const tmpans = tmp.Questionstatistics
            for(let i = 0;i < tmpans.length;i++){
                let namelists:string[] = []
                namelists.push(tmpans[i].Anamelist)
                namelists.push(tmpans[i].Bnamelist)
                namelists.push(tmpans[i].Cnamelist)
                namelists.push(tmpans[i].Dnamelist)
                let tmps = {
                    acc:[
                        {
                            name:'A',
                            value:tmpans[i].ChooseA
                        },
                        {
                            name:'B',
                            value:tmpans[i].ChooseB
                        },
                        {
                            name:'C',
                            value:tmpans[i].ChooseC
                        },
                        {
                            name:'D',
                            value:tmpans[i].ChooseD
                        }
                    ],
                    ans:String(tmpans[i].Answeroptions),
                    namelist:namelists
                }
                contents.queacc[i] = tmps
            }
            setContents({...contents})
            if(contents.acc.length !== 0 ){
                setgraphci()
            }
            console.log(contents)
        })
    }
    const setgraphci = ()=>{
        // 设置绘图
        const chartDom1 = document.getElementById('chart1')!
        const myChart1 = echarts.init(chartDom1)
        myChart1.setOption({
            title: {
                text: '题目正确率'
            },
            tooltip:{
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                data:contents.seqnum,
                axisTick:{
                    alignWithlabel:true
                },
                axisLabel: {
                    interval:0,// 代表显示所有x轴标签显示
                }
            },
            yAxis: {
                type: 'value'
            },
            series : [
                {
                    name:'正确率',
                    type:'bar',
                    barWidth: '50%',
                    data: contents.acc,
                    itemStyle:{
                        normal:{
                            color: new echarts.graphic.LinearGradient(
                                0, 1, 0, 0, //4个参数用于配置渐变色的起止位置, 这4个参数依次对应右/下/左/上四个方位. 而0 1 0 0则代表渐变色从正下方开始
                                [
                                    {offset: 0, color: '#a8edea'},
                                    {offset: 0.5, color: '#fed6e3'},
                                ] //数组, 用于配置颜色的渐变过程. 每一项为一个对象, 包含offset和color两个参数. offset的范围是0 ~ 1, 用于表示柱状图的位置
                            )
                        }
                    }
                }
            ]
        })
        return myChart1
    }
    // 绘制图表
    // const getsOption = (acc:number[],seq:number[]) =>{
    //     // todo 处理数据
    //     let option = {
    //         title: {
    //             text: '题目正确率'
    //         },
    //         tooltip:{
    //             trigger: 'axis'
    //         },
    //         xAxis: {
    //             type: 'category',
    //             data: (()=>{
    //                 let list:number[] = []
    //                 seq.map((item)=>{
    //                     list.push(item)
    //                 })
    //                 return list
    //             }),
    //             axisTick:{
    //                 alignWithlabel:true
    //             }
    //         },
    //         yAxis: {
    //             type: 'value'
    //         },
    //         theme:'light',
    //         series : [
    //             {
    //                 name:'正确率',
    //                 type:'bar',
    //                 barWidth: '50%',
    //                 data: [acc],
    //                 itemStyle:{
    //                     normal:{
    //                         color: new echarts.graphic.LinearGradient(
    //                             0, 1, 0, 0, //4个参数用于配置渐变色的起止位置, 这4个参数依次对应右/下/左/上四个方位. 而0 1 0 0则代表渐变色从正下方开始
    //                             [
    //                                 {offset: 0, color: '#a8edea'},
    //                                 {offset: 0.5, color: '#fed6e3'},
    //                             ] //数组, 用于配置颜色的渐变过程. 每一项为一个对象, 包含offset和color两个参数. offset的范围是0 ~ 1, 用于表示柱状图的位置
    //                         )
    //                     }
    //                 }
    //             }
    //         ]
    //     }
    //     return option
    // }
    // 后端传递的数据，包括每道选择题的
    const getOption = (acc:quessacc[],index:number)=>{
        // todo 处理数据
        let option = {
            title: {
                text: '第'+(index+1)+'题统计情况',
                x: 'left'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                top: 20,
                right: 5,
                data: ['A','B','C','D']
            },
            series : [
                {
                    name:'选择人数占比',
                    type:'pie',
                    radius: ['30%', '80%'],
                    label: {
                        normal: {
                            show: true,
                            position: 'insideRight',
                            formatter: '{c}%'
                        }
                    },
                    data:acc,
                }
            ]
        }
        return option
    }
    return (
        <div className="details" style={{backgroundImage:"linear-gradient(to top, #a8edea 0%, #fed6e3 100%)"}}>
            <div className="ccontainer">
                <div className="part1">
                    <Link to='/Mycollection' className="link_box">
                        <img className="home" style={{width:'20px',paddingTop:'4px'}} src="./back.svg" alt="svg1" />
                        文件收集
                    </Link>
                </div>
                <div className="part2">
                    <div className="part2_left">
                        <div>{headdata.quescount}</div>
                        <div>
                            <img className="home" style={{width:'18px',paddingTop:'3px'}} src="./document.svg" alt="document" />
                            已收问卷数
                        </div>
                    </div>
                    <div className="part2_middle">
                        <div>{headdata.filecount}</div>
                        <div>
                            <img className="home" style={{width:'18px',paddingTop:'3px'}} src="./file.svg" alt="file" />
                            已收文件数
                        </div>
                    </div>
                    <div className="part2_right">
                        {
                            headdata.ddl < time?
                            <div id="part2_right">已截止</div>
                            :
                            <>
                                <div id="part2_right" style={{color:'green'}}>进行中</div>
                                <div>
                                    <img className="home" style={{width:'18px',paddingTop:'3px'}} src="./ddl.svg" alt="ddl" />
                                    截止倒计时
                                    <div>
                                        {`${day}天${hour}时${minute}分${second}秒`}
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                </div>
                <div className="part3">
                    <div className="tab_lists">
                        <ul className="tab_list_ul">
                            <li onClick={()=>choose(1)} className={ischoose1?'current':''} >
                                <img className="home" style={{width:'16px'}} src="./list.svg" alt="list" />
                                应交名单
                            </li>
                            <li onClick={()=>choose(2)} className={ischoose2?'current':''} >
                                <img className="home" style={{width:'16px'}} src="./document.svg" alt="document" />
                                提交记录
                            </li>
                            <li onClick={()=>choose(3)} className={ischoose3?'current':''} >
                                <img className="home" style={{width:'16px'}} src="./num.svg" alt="num" />
                                统计图表
                            </li>
                        </ul>
                        <div id="watchCollection">
                            {/* todo 发送get获得文件 */}
                            <div id="downloadExcel" onClick={()=>getxls()}>
                                <img className="home" style={{width:'16px',paddingTop:'2px'}} src="./file.svg" alt="file" />
                                查看汇总
                            </div>
                            <div id="downloadFile" onClick={()=>getrar()}>
                                <img className="home" style={{width:'16px',paddingTop:'2px'}} src="./rar.svg" alt="rar" />    
                                下载文件
                            </div>
                        </div>
                    </div>
                    <div className="tab_con">
                        <div className="citem" style={{display:ischoose1?'block':'none'}}>
                            <div className="part4">
                                {/* 姓名内容 */}
                                <div className="name_box" id="name_box">
                                    <List
                                        className="demo-loadmore-list"
                                        itemLayout="horizontal"
                                        dataSource={nameList}
                                        renderItem={(item,index) => (
                                            <List.Item
                                            actions={[<button className="btn_add" key="delete name" onClick={()=>showmodal(index)}>删除</button>]}
                                            >
                                            <Skeleton avatar loading={false} title={false} active>
                                                <div>
                                                    姓名:{item.name}
                                                    </div>
                                                <div>
                                                    邮箱:{item.email === ''?'暂无邮箱':item.email}
                                                </div>
                                            </Skeleton>
                                            </List.Item>
                                        )}
                                    />
                                    {contextHolder}
                                </div>
                                <div className="foot_but">
                                    <button onClick={()=>setIsadd(true)} className="btn_add" style={{marginLeft:'10%'}}>添加姓名</button>
                                    <button id="sendEmail" onClick={()=>sendemail()} style={{marginLeft:'40%'}}>一键催交</button>
                                    {contextHolders}
                                    <div>
                                        <Modal
                                            open={is_add}
                                            footer={null}
                                            closable={false}
                                        >
                                            <textarea value={names} onChange={e =>{getname(e)}} className="inputname" placeholder="请按行输入姓名或以英文逗号分隔,如:张三,李四" />
                                            <button onClick={addName} className="btn_add" style={{marginLeft:'40%'}}>确认</button>
                                        </Modal>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* 提交记录 */}
                        <div className="citem" style={{display:ischoose2?'block':'none'}}>
                            <div className="part4">
                                <Table columns={columns} dataSource={collections} />
                            </div>       
                        </div>
                        {/* 统计图表 */}
                        <div className="citem" style={{display:ischoose3?'block':'none'}}>
                            <div className="part4">
                                {/* 题目正确率，使用柱状图表示 */}
                                <div className="chartContainer">
                                    <div id="chart1" style={{width:'100%',height:'350px'}}></div>
                                    {/* <ReactEcharts className="charts" theme={"light"} option={getsOption(contents.acc,contents.seqnum)}/> */}
                                </div>
                                {/* 每道题，使用饼状图表示 */}
                                {/* 后端传过来每道题的数据，给出每道题的选择情况以及名单，绘制图形 */}
                                {
                                    contents.queacc.length === 0?
                                    <div>暂无填写记录哦</div>
                                    :
                                    <div className="chartContainer">
                                        {contents.queacc.map((item, index) => (
                                            <>
                                                <ReactEcharts className="chart" theme={"light"} option={getOption(item.acc,index)}/>
                                                {/* 每道题所传递的名单 */}
                                                <div className="namelists">
                                                     {/* 每道题所传递的名单 */}
                                                    <div className="namelists">
                                                        <div className="acres">
                                                            正确答案: {item.ans}
                                                        </div>
                                                        <Tabs
                                                            style={{marginTop:'5%'}}
                                                            tabPosition={"left"}
                                                            items={item.namelist.map((text, i) => {
                                                            const id = String.fromCharCode(i + 65) 
                                                            return {
                                                                label: `选${id}名单`,
                                                                key: id,
                                                                children: text,
                                                            };
                                                            })}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        ))}
                                    </div>
                                }
                            </div>       
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default CollectionDetails