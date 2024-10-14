
```
var obj = [];
var obj1 = [];
obj.map((item,index)=>{
    obj1[index] = {
        "notation": item.name,
        "name": item.hto,
        "trans": [
          `舒聲字：${item.shus}`,
          `入聲字：${item.cus}`,
          item.demo
        ],
        "voice": typeof(item.voice) == 'string' ? item.voice : ( item.voice.length > 0 ? item.voice[0].voice : "") 
    };
})
console.log(JSON.stringify(obj1));
```

```
obj1 = [];
obj.map((item,index)=>{
    obj1[index] = {
        "notation": item.name,
        "name": `a${item.diaohao}`,
        "trans": [
          `調符(例)：${item.hto}`,
          `例字：${item.lizi}`,
          item.demo
        ],
        "voice": typeof(item.voice) == 'string' ? item.voice : ( item.voice.length > 0 ? item.voice[0].voice : "") 
    };
});
JSON.stringify(obj1);
```