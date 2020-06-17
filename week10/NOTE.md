# 笔记



![image-20200617233819949](http://imgs.devzhangjs.com/153820.png)

![image-20200617233840305](http://imgs.devzhangjs.com/153840.png)



## DOM子元素逆序



### 方案一

```HTML
<div id="a">
	<span>1</span>
	<span>2</span>
	<span>3</span>
	<span>4</span>
</div>

<script>
let element = document.getElementById("a");

function reverseChildren(element){
	let children = Array.prototype.slice.call(element.childNodes);
	
	element.innerHTML = "" // dom 会自动remove
	
	children.reverse();
	
	for(let child of children){
		element.appendChild(child)
	}
}
reverseChildren(element)
</script>
```



### 方案二



```HTML
<div id="a">
	<span>1</span>
	<span>2</span>
	<span>3</span>
	<span>4</span>
</div>

<script>
    let element = document.getElementById("a");
	 
	 function reverseChildren(element){
         var l = element.childNodes.length;
         while(l-- >0){
             element.appendChild(element.childNodes[l])
         }
     }
	 reverseChildren(element);
</script>
```



### 方案三



```HTML
<div id="a">
	<span>1</span>
	<span>2</span>
	<span>3</span>
	<span>4</span>
</div>

<script>
    let element = document.getElementById("a");
	 
	 function reverseChildren(element){
         let range = new Range();
         range.selectNodeContents(element); //选择
         
         let fragment = range.extractContents(); //拷贝
         
         var l = fragment.childNodes.length;
         while(l-- >0){
             fragment.appendChild(fragment.childNodes[l])
         }
         element.appendChild(fragment);
     }
	 reverseChildren(element);
</script>
```

























