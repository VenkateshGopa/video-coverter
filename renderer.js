const ipc = require('electron').ipcRenderer;
const buttonCreated = document.getElementById('upload');
const process = require('child_process')
const $ = require('jquery')
const path = require('path')
var randomString = require('random-string');
const fs = require('fs')

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

document.getElementById("newproject").addEventListener('click' , function(){
    document.getElementById("welcome").style.display="none";
    document.getElementById("selectfile").style.display="block";
})

document.getElementById("new").addEventListener('click' , function(){
    document.getElementById("welcome").style.display="block";
    document.getElementById("selectfile").style.display="none";
})

buttonCreated.addEventListener('click', function (event) {
    ipc.send('open-file-dialog-for-file')
});

ipc.on('selected-file', function (event, paths) {
    console.log(event)
    var randomId = randomString()
    $("#info").append(`
        <div id=${randomId} class="alert alert-success">
          ${paths} is converting So Please Wait
         </div>
    `
    )
    console.log('Full path: ', paths)

// open input stream
var infs = new ffmpeg

infs.addInput(paths).outputOptions([
    '-map 0:0',
    '-map 0:1',
    '-map 0:0',
    '-map 0:1',
    '-s:v:0 2160x3840',
    '-c:v:0 libx264',
    '-b:v:0 2000k',
    '-s:v:1 960x540',
    '-c:v:1 libx264',
    '-b:v:1 365k',
    '-master_pl_name master.m3u8',
    '-f hls',
    '-max_muxing_queue_size 1024',
    '-hls_time 1',
    '-hls_list_size 0',
    '-hls_segment_filename', 'v%v/fileSequence%d.ts'
    ]).output('/video.m3u8')
    .on('start', function (commandLine) {
        console.log('Spawned Ffmpeg with command: ' + commandLine);
    })
    .on('end', function (err, stdout, stderr) {
        console.log('Finished processing!' /*, err, stdout, stderr*/)
        $(`#${randomId}`).detach()
        Notification.requestPermission().then(function(result){
            var myNotification = new Notification('Conversion Completed',{
                body:"Your file was successfully converted"
            });
                    
        })
        if (error !== null) {
             console.log('exec error: ' + error);
        }
    }).run()
});