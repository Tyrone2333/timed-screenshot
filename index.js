const screenshot = require('screenshot-desktop')
const nodemailer = require('nodemailer')
const schedule = require('node-schedule')
const fs = require('fs-extra')
function formatFixedDate(date, fmt) {
    if(typeof date === 'number') {
        date = new Date(date)
    }
    if(!(date instanceof Date)) {
        return ''
    }
    var o = {
        "M+" : date.getMonth()+1, //月份
        "d+" : date.getDate(), //日
        "h+" : date.getHours()%12 == 0 ? 12 : date.getHours()%12, //小时
        "H+" : date.getHours(), //小时
        "m+" : date.getMinutes(), //分
        "s+" : date.getSeconds(), //秒
        "q+" : Math.floor((date.getMonth()+3)/3), //季度
        "S" : date.getMilliseconds() //毫秒
    }
    var week = {
        "0" : "日",
        "1" : "一",
        "2" : "二",
        "3" : "三",
        "4" : "四",
        "5" : "五",
        "6" : "六"
    }
    if(/(y+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length))
    }
    if(/(E+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "星期" : "周") : "")+week[date.getDay()+""])
    }
    for(var k in o){
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)))
        }
    }
    return fmt
}

// 配置邮件相关
const transporter = nodemailer.createTransport({
    host: "",
    secure: true,
    port: 465,
    auth: {
        user: "",
        pass: "",
    },
    debug: true, // include SMTP traffic in the logs
})

// 定时规则, 8-23 点定时执行
let cron = '0 0 8-23 * * ? '

console.log('任务开始,默认 8-23 点定时截图')

schedule.scheduleJob(cron, async function () {
    const date = new Date()
    let fileName = formatFixedDate( date.getTime(),'yyyy-MM-dd HH-mm-ss')
    let folderName = formatFixedDate( date.getTime(),'yyyy-MM')

    let targetDir = `./screenshot/`+folderName
    await fs.ensureDir(targetDir)

    // console.log(fileName)

    // 截图
    screenshot().then((img) => {
        fs.writeFile(targetDir + `/${fileName}.jpg`, img, function (err) {
            if (err) {
                throw err
            }
            console.log(targetDir + `/${fileName}.jpg`)
        })
        // const message = {
        // 	from:"",
        // 	to:"",
        // 	subject:"桌面截图",
        // 	html:'桌面截图：<img src="cid:test"/>',
        // 	attachments:[
        // 		{
        // 			filename: 'out',
        // 			path: __dirname + '/out.jpg',
        // 			cid: 'test' // should be as unique as possible
        // 		}
        // 	]
        // }
        // // send
        // transporter.sendMail(message, (error, info) => {
        // 	if (error) {
        // 		console.log('Error occurred', error.message)
        // 		return
        // 	}
        // 	console.log(`Message sent successfully! Server responded with "${info.response}"`)
        // 	transporter.close()
        // })
    }).catch((err) => {
        throw err
    })
})
