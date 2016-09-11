# 编译

```bash
npm install
npm run build
```

# 使用

```html
<script src="lib/index.js"></script>
<script>
  var linestring = 'LINESTRING(13409483.524918 4315286.3012032,13409813.159602 4314827.6790335,13410405.546571 4315085.654004,13410539.311371 4314636.5864628)';
  var buffer = 50;

  var pois = [{
    name: '深圳路银川东路',
    x: 13409581, 
    y: 4315163
  }, {
    name: '深圳路仙霞岭路',
    x: 13409816, 
    y: 4314830.5
  }, {
    name: '秦岭路苗岭路',
    x: 13410549, 
    y: 4314637.5
  }, {
    name: '秦岭路仙霞岭路',
    x: 13410392, 
    y: 4315084
  }, {
    name :'燕岭路仙霞岭路',
    x: 13410098, 
    y: 4314954.5,
  }, {
    name: '银川东路燕岭路',
    x: 13409893, 
    y: 4315302.5
  }];

  var list = window.sortPoisInLinestringBufferByDirection(linestring, buffer, pois);

  console.log(list);
</script>
```