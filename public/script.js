let loading=document.getElementById('loading');
let result=document.getElementById('result');
let url=document.getElementById('url');
let submit=document.getElementById('btn');
let urlresult=document.getElementById('url-result');
let copyBtn=document.getElementById('copy-btn');

submit.addEventListener('click',()=>{
    loading.style.display='block';
    let longUrl=url.value;
    fetch('/shorten',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            longUrl
        })
    }).then(res=>res.json())
    .then(data=>{
        loading.style.display='none';
        result.style.display='block';
        urlresult.innerText=data.shortUrl;
        urlresult.href=data.shortUrl;
        copyBtn.addEventListener('click',()=>{
            navigator.clipboard.writeText(data.shortUrl);
            alert('Copied to clipboard');
        });

        
    })
}
);
