var Card=function(){
	//中文名
	var S_COLOR=['#000000','#FF0000','#000000','#FF0000','#000000','#FF0000'];
	var N_REAL_NAME={
		11:'J',
		12:'Q',
		13:'K',
		14:'A',
		15:'2',
		16:'X',
		17:'Y'
	};
	//花色：黑 红 梅 方
	var suit=[0,1,2,3];
	//2 3 4 5 6 7 8 9 10 Jack queen king ace
	var num=[3,4,5,6,7,8,9,10,11,12,13,14,15];	
	var num_jk=[16,17];
	//Joker: black Joker , red Joker
	var joker=[4,5];
	//分隔符
	var SEP='_';
	//洗好的牌
	var poker=[];
	//牌的长宽
	var CD_W=57;
	var CD_H=88;
	//this
	var that=this;
	/**
	 *合牌 
	 */
	this.deck=function(){
		var arr=[];
		for(var i=0;i<suit.length;i++){
			for(var j=0,l=num.length;j<l;j++){
				arr.push(suit[i]+SEP+num[j]);
			}
			//大小王分开插入
			i<2&&arr.push(joker[i]+SEP+num_jk[i]);
		}
		return arr;
	}();
	/**
	 *洗牌 
	 */
	this.shuffle=function(){
		//洗牌
		var deck=this.deck;
		
		var swap=function(x,y){
			x=parseInt(x);
			y=parseInt(y);
			var temp=deck[x];
			deck[x]=deck[y];
			deck[y]=temp;
		}
		for(var i=0;i<54;i++){
			swap(Math.random()*54,Math.random()*54);
		}
			
		poker=deck.slice(0);
		
		//端牌
		var second=poker.splice(parseInt(Math.random()*54||34));
		poker=second.concat(poker);
	}
	/**
	 * 排序
	 */
	this.sort=function(arr){
		return arr.sort(function(a,b){
			var ax=a.split(SEP),ay=b.split(SEP)
			return (ax[1]-ay[1])||(ay[0]-ax[0]);
		});
	}
	/**
	 *分牌 
	 */
	this.deal=function(len){
		return this.sort(poker.splice(0,len||1));
	}
	/**
	 * 卡片模版
	 */
	this.cardTemp=function(){
		var canvas=document.createElement('canvas');
		canvas.width=CD_W;
		canvas.height=CD_H;
		var ctx=canvas.getContext('2d');
		ctx.fillStyle='#000000';
		ctx.font='bold 14px Arial';
		
		var img=new Image();
		img.onload=function(){
			//ctx.fillRect(1,1,CD_W-2,CD_H-2);
			ctx.drawImage(img,28,0,115,172,0,0,CD_W,CD_H);
		}
		img.src='card.png';
		return [canvas,ctx,img];
	}();
	/**
	 * 卡片工厂
	 */
	this.fac=function(str){
		var arr=str.split(SEP),ctx=this.cardTemp[1],color=S_COLOR[arr[0]]||'#000000';
		ctx.save();
		ctx.fillStyle='#ffffff';
		ctx.fillRect(2,2,CD_W-4,CD_H-4);
		ctx.fillStyle=color;
		
		var draw=function(){
			if(arr[0]<4){
				ctx.fillText(N_REAL_NAME[arr[1]]||arr[1],(arr[1]==10?7:10),20);
				ctx.drawImage(that.cardTemp[2],0,arr[0]*28,28,28,10,25,10,10);
			}
			else{
				ctx.font='bold 10px Arial';
				for(var jk='JOKER',i=0;i<5;i++){
					ctx.fillText(jk[i],10,20+i*11);
				}
			}
			
			
		}
		draw();
		ctx.translate(CD_W,CD_H);
		ctx.rotate(Math.PI);
		draw();
		ctx.restore();
		
		var img=document.createElement('img');
		img.src=this.cardTemp[0].toDataURL();
		return img;
	}
	
}


var Lord=function(tableId){
	var $=function(id){
		return document.getElementById(id);
	};
	var addEvt=function(el,type,hdl){
		el.addEventListener(type,function(evt){
			hdl(evt,evt.target);
		});
	};
	var Evt='createTouch' in document?['touchstart','touchmove','touchend']:['mousedown','mousemove','mouseup'];
	
	var card=new Card();
	var tableEl=$(tableId[0]);
	var deskEl=$(tableId[1]);
	//pre
	var PRE='card_';
	var CLS=['left','bottom','right'];
	//记录角色
	var chairs=[
		//{role:'',card:''}
	];
	//记录桌面上的牌
	var inDesk={seq:[],type:''};
	//记录当前或最终优胜者
	var winner;
	//记录出牌方
	var turn;
	//记录叫牌状态
	var bidState=0;
	//this
	var that=this;
	
	/**
	 * join
	 */
	this.join=function(){
		var roleName=arguments[0];
		if(!roleName){
			return false;
		}
		chairs.length==3?this.msg('人数已够'):this.sit(roleName);
	}
	/**
	 * sit
	 */
	this.sit=function(){	
		var chair=document.createElement('div'),
			hand=document.createElement('span'),
			role=document.createElement('div'),
			btn=document.createElement('div');
			
			var labelPlay=document.createElement('label');
			labelPlay.innerHTML='出牌';
			labelPlay.className='close';
			labelPlay.setAttribute('action','play');
			
			var labelSkip=document.createElement('label');
			labelSkip.innerHTML='跳过';
			labelSkip.className='close';
			labelSkip.setAttribute('action','skip');
			
			var labelBid=document.createElement('label');
			labelBid.innerHTML='叫牌'
			labelBid.className='close';
			labelBid.setAttribute('action','bid');
				
			roleName=arguments[0];
			
			
		chairs.push({
			chair:chair,
			role:role,
			hand:hand,
			seq:[],
			len:0,
			roleName:roleName,
			btn:{
				play:labelPlay,
				skip:labelSkip
			},
			btnBid:labelBid,
			btnNodeL:btn
		});
		
		//
		roleIndex=chairs.length-1;
		
		btn.setAttribute('role',roleIndex);
		btn.className='btn';
		btn.style.display="none";
		role.className='role';
		chair.className=CLS[roleIndex];
		hand.className='card';
		
		btn.appendChild(labelPlay);
		btn.appendChild(labelSkip);
		btn.appendChild(labelBid);
		
		chair.appendChild(hand);
		chair.appendChild(role);
		chair.appendChild(btn);
		tableEl.appendChild(chair);
		
		this.render(roleIndex,{role:roleName});
		
		chairs.length==3&&this.start();
		
		//
		//
		var select=function(el,active){
			el.setAttribute('active',active);
			el.style.marginTop=(active?'-10':'0')+'px';
		};
	
		
		addEvt(chair,Evt[0],function(evt,target){
			target.nodeName.toLowerCase()=='img'&&function(){
				var active=target.getAttribute('active')*1;
				select(target,1-active);
			}();
		})
		addEvt(btn,Evt[0],function(evt,target){
			if(target.nodeName.toLowerCase()=='label'){
				var role=target.parentNode.getAttribute('role');
				var action=target.getAttribute('action');
				var cds=[];
				if(action=='play'){
					var cds=function(){
						var els=chairs[role].hand.getElementsByTagName('img'),arr=[];
						for(var i=0;i<els.length;i++){
							els[i].getAttribute('active')*1&&arr.push(els[i].id.replace(PRE,''));
						}
						return arr;
					}();
					if(cds.length<1){
						that.msg('请选择手牌');
						return false;
					}
				}
				else if(action=='bid'){
					that.bid(role);
					return false;
				}
				that.play(role,cds)
			}
		})
		
		this.msg(chairs.length==3?'人数已够，发牌！':roleName+'加入，还差 【'+(3-chairs.length)+'】 人');
	}
	/**
	 * render
	 */
	this.render=function(i,attr,update){
		for(var p in attr){
			if(p=='hand'){
				update&&(chairs[i][p].innerHTML='');
				var len=attr[p].length;
				for(var j=0;j<len;j++){
					var img=card.fac(attr[p][j]);
					img.id=PRE+attr[p][j];
					img.setAttribute('role',i);
					img.setAttribute('active',0);
					chairs[i][p].appendChild(img);
				}
				//手牌数量
				chairs[i].len=len;
			}
			else if(p=='role'){
				chairs[i][p].innerHTML=attr[p];
			}
		}
		
	}
	/**
	 * 游戏开始
	 */
	this.start=function(){
		if(chairs.length<3){
			this.msg('人数不够');
			return false;
		}
		bidState=0;
		
		card.shuffle();
		for(var i=0;i<3;i++){
			chairs[i].seq=card.deal(17);
			this.render(i,{hand:chairs[i].seq},1);
			chairs[i].btnNodeL.style.display="";
		}
		
		this.desk(card.deal(3),1);
		this.setBtn(3);
		//设定地主
		this.setTurn(parseInt(Math.random()*3));
	}
	/**
	 * 游戏结束
	 */
	this.end=function(){
		for(var i=0;i<3;i++){
			chairs[i].btnNodeL.style.display="none";
		}
		this.msg(chairs[winner].roleName+' 胜利，点击【start】重新开始!');
	}
	/**
	 * 桌面管理
	 */
	this.desk=function(arr,update){
		arr.length>0&&(inDesk.seq=arr,inDesk.type=this.translate(arr));
		update&&(deskEl.innerHTML='');
		for(var i=0;i<arr.length;i++){
			deskEl.appendChild(card.fac(arr[i]));
		}
	}
	/**
	 * 叫牌
	 */
	this.bid=function(i){
		//如果已经叫牌过 或 没轮到自己叫牌
		if(bidState||i!=turn){
			return false;
		}
		var chair=chairs[i];
		var seq=card.sort(chair.seq.concat(inDesk.seq));
		this.render(i,{hand:seq},1);
		
		this.desk([],1);
		
		this.setTurn(i,1);
	}
	this.setBtn=function(i,flag){
		if(flag==2){
			for(var j=0;j<3;j++){
				chairs[j].btnBid.className=i==j?'open':'close';;
			}
		}
		else{
			for(var j=0;j<3;j++){
				var btn=chairs[j].btn;
				for(var p in btn){
					btn[p].className=i==j?'open':'close';
					flag==1&&(chairs[j].btnBid.className='none');
				}
			}
			
		}
	}
	/**
	 * 设置轮次
	 */
	this.setTurn=function(i,bid){
		i=i>2?0:i;
		turn=i;
		//如果还没叫牌
		if(!bidState){
			winner=i;
			//如果叫牌了，则修改状态
			if(bid){
				bidState=1;
				this.setBtn(i,1);
				return true;
			}
			//否则，则跳叫牌
			else{
				this.setBtn(i,2);
				return true;
			}
		}
		this.setBtn(i);
	}
	/**
	 * 出牌
	 */
	this.play=function(i,arr){
		//如果轮到自己 inDesk
		if(turn==i&&bidState){
			var len=arr.length,gaveup=len<1,lead=turn==winner;
			//如果上轮胜者是自己，则不能放弃
			if(gaveup&&lead){
				this.msg('不能放弃');
				return false;
			}
			
			//如果选择出牌，不能出杂乱的牌
			if(!gaveup&&!this.translate(arr)){
				this.msg('请按规则出牌');
				return false;
			}
			
			//如果自己不是胜者，则需要出牌大于桌上的牌 或者放弃
			if(!gaveup&&!lead&&!this.compare(arr)){
				this.msg('请按规则出牌');
				return false;
			}
			
			if(gaveup){
				this.msg('放弃本轮出牌');
			}
			
			var hand=chairs[i].hand;
			this.desk(arr,lead);
			for(var j=0;j<len;j++){
				hand.removeChild($(PRE+arr[j]));
			}
			
			//arr的长度为0 表示用户放弃当前出牌机会
			len>0&&(winner=i);
			
			//如果当前手牌为0 则胜利，否则 出牌轮向下一位
			chairs[i].len=chairs[i].len-len;
			chairs[i].len?this.setTurn(++i):this.end();
		}
		else{
			//如果是还未叫牌 且跳过
			if(!bidState&&arr.length<1){
				this.setTurn(++i);
			}
			else{
				this.msg('还为轮到出牌');
			}	
		}
		
	}
	this.msg=function(msg){
		//console.log(msg);
		$('msg').innerHTML=msg;
	}
	/**
	 * 
	 */
	this.compare=function(arr){
		var tDesk=inDesk.type,tHand=this.translate(arr);
		//放弃
		if(arr.length<1){
			return false;
		}
		//如果桌面上或者出牌是双王
		else if(tDesk=='jokers'^tHand=='jokers'){
			return tHand=='jokers';
		}
		//如果桌面上或者出牌是炸弹
		else if(tDesk=='four'^tHand=='four'){
			return tHand=='four';
		}
		//如果个数相同
		else if(arr.length==inDesk.seq.length&&tDesk==tHand){
			//4-2的时候这样的算法有问题
			var index=parseInt(arr.length/2);
			return  arr[index].split('_')[1]*1>inDesk.seq[index].split('_')[1]*1;
		}
		return false;
	}
	/**
	 * 识别
	 */
	this.translate=function(arr){
		//single 单个
		//pair 对子
		//three 三个
		//four 四个
		//pairs 多个对子
		//straight 顺子
		//jokers 一对王
		//suit 同花
		//plain 飞机
		//mess 杂乱
		var nTemp=[],//数字序列
			sTemp=[],//花色序列
			oTemp={},//计数对象
			nSeq=[],//计数队列
			oSeqSeq={};//计数队列的对象，可以用于统计对子、三个出现多少次
			
		for(var i=0,tmp;i<arr.length;i++){
			tmp=arr[i].split('_');
			sTemp.push(tmp[0]);
			nTemp.push(tmp[1]);
			oTemp[tmp[1]]=oTemp[tmp[1]]?oTemp[tmp[1]]+1:1;
		};
		//nTemp排序
		nTemp.sort(function(a,b){
			return a-b;
		});
		//序列化计数队列
		for(var p in oTemp){
			oSeqSeq[oTemp[p]]=oSeqSeq[oTemp[p]]?oSeqSeq[oTemp[p]]+1:1;
			nSeq.push(oTemp[p]);
		}
		nSeq.sort(function(a,b){
			return b-a;
		});
		
		
		
		if(nTemp.length==1){
			return 'single';
		}
		else if(nTemp.length==2){
			return oSeqSeq['2']==1?'pair':(nTemp[0]>15&&nTemp[1]>15?'jokers':false);
		}
		
		//计数为3的统计次数为1，序列长度最大为2；
		else if(oSeqSeq['3']==1&&nSeq.length<3){
			return 'three'+(nSeq.length==1?'':('_'+nSeq[1]));
		}
		//计数为4的统计次数为1，序列长度最大为3；
		else if(oSeqSeq['4']==1&&nSeq.length<4){
			var len=nTemp.length,
				t=len==4?'':(len==6?'1':(len==8?'2':'9'));
			if(t==9){
				return false;
			}
			return 'four'+(t?'_'+t:'');
		}
		//飞机 计数为3的统计大于1；
		else if(oSeqSeq['3']>1){
			
			//总长度 5*count[前提是都是对] 或者4*count 或者3*count
			var count=oSeqSeq['3'],len=nTemp.length,
				t=count*3==len?'':(count*4==len?'1':(count*5==len&&oSeqSeq['2']==count?'2':'9'));
			
			if(t==9){
				return false;
			}
			
			//要保证是连着的
			var arr=[];
			for(var p in oTemp){
				oTemp[p]==3&&arr.push(p);
			}
			
			arr.sort(function(a,b){
				return a-b;
			});
			
			if(arr[arr.length-1]-arr[0]+1!=count){
				return false;
			}
			
			//return nSeq.length==(count||2*count)?'plain_'+nSeq.length:false;
			return 'plain_'+count+(t?'_'+t:'');
		}
		
		//不可以带王和2
		//连队
		else if(nSeq[0]==2&&oSeqSeq['2']>2&&nTemp.length==oSeqSeq['2']*2){
			return nTemp[nTemp.length-1]-nTemp[0]+1==oSeqSeq['2']?'pairs_'+oSeqSeq['2']:false;
		}
		//顺子
		else if(nSeq[0]==1&&nTemp.length>4){
			return nTemp[nTemp.length-1]-nTemp[0]+1==nTemp.length?'straight':false;
		}
		
		return false;
	}
}
