import React, { forwardRef, useState, useEffect, useRef, useImperativeHandle} from 'react';
import PropTypes from 'prop-types';
import BScroll from 'better-scroll';
import styled from 'styled-components';
const ScrollContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`

const Scroll = forwardRef((props, ref)=>{
  const [bScroll,setBScroll] = useState()
  //current 指向初始化 bs 实例需要的 DOM 元素
  const scrollContaninerRef = useRef()
  //从pros中解构参数
  const { direction, click, refresh,  bounceTop, bounceBottom } = props
  const { pullUp, pullDown, onScroll } = props

  useEffect(() => {   //创建better-scroll
    const scroll = new BScroll(scrollContaninerRef.current,{
      scrollX: direction === 'horizental',
      scrollY: direction === 'vertical',
      probeType: 3,
      click,
      bounce: {
        top: bounceTop,
        bottom: bounceBottom
      }
    })

    setBScroll( scroll )  //创建BScroll实例

    return () => {
      setBScroll(null)  //清除BScroll
    }
  }, [])

  useEffect(()=>{ //每次重新渲染刷新实例，防止无法滑动
    if (refresh && bScroll){
      bScroll.refresh()
    }
  })

  useEffect(()=>{ //实例绑定scroll事件
    if (!bScroll || !onScroll ) return

    bScroll.on("scroll", (scroll) => {
      onScroll (scroll)
    })
    return ()=> {
      bScroll.off('scroll')
    }
  }, [onScroll,bScroll])

  useEffect(() => { //进行上拉到底的判断，调用上拉刷新的函数
    if (!bScroll || !pullUp) return
    bScroll.on('scrollEnd', ()=>{
      //判断是否滑动到底部
      if(bScroll.y <= bScroll.maxScrollY + 100 ){
        pullUp()
      }
    })
    return () => {
      bScroll.off('scrollEnd')
    }
  }, [pullUp,bScroll])

  useEffect(()=>{ //进行下拉的判断，调用下拉刷新的函数
    if(!bScroll || !pullDown ) return
    bScroll.on('touchEnd', (pos)=>{
      if(pos.y > 50) {
        pullDown()
      }
    })
    return () => {
      bScroll.off('touchEnd')
    }
  },[pullDown,bScroll])

  useImperativeHandle(
    ref,
    () => ({
      refresh(){
        if(bScroll){
          bScroll.refresh()
          bScroll.scrollTo(0,0)
        }
      },
      getBScroll(){
        if(bScroll){
          return bScroll
        }
      }
    }))

  return(
    <ScrollContainer ref={scrollContaninerRef}>
      {props.children}
    </ScrollContainer>
  )
})

Scroll.defaultProps = {
  direction: "vertical",
  click: true,
  refresh: true,
  onScroll:null,
  pullUpLoading: false,
  pullDownLoading: false,
  pullUp: null,
  pullDown: null,
  bounceTop: true,
  bounceBottom: true
}

Scroll.propTypes = {
  direction: PropTypes.oneOf (['vertical', 'horizental']),// 滚动的方向
  click: true,// 是否支持点击
  refresh: PropTypes.bool,// 是否刷新
  onScroll: PropTypes.func,// 滑动触发的回调函数
  pullUp: PropTypes.func,// 上拉加载逻辑
  pullDown: PropTypes.func,// 下拉加载逻辑
  pullUpLoading: PropTypes.bool,// 是否显示上拉 loading 动画
  pullDownLoading: PropTypes.bool,// 是否显示下拉 loading 动画
  bounceTop: PropTypes.bool,// 是否支持向上吸顶
  bounceBottom: PropTypes.bool// 是否支持向下吸底
};

export default Scroll