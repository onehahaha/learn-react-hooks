import React, { useState, useEffect, useContext } from 'react';
import Horizen from '../../baseUI/horizen-item';
import Scroll from '../../baseUI/scroll/index'
import { categoryTypes, alphaTypes } from '../../api/config';
import {
  NavContainer,
  List,
  ListContainer,
  ListItem
} from "./style";
import {
  getSingerList,
  getHotSingerList,
  changeEnterLoading,
  changePageCount,
  refreshMoreSingerList,
  changePullUpLoading,
  changePullDownLoading,
  refreshMoreHotSingerList
} from './store/actionCreators';
import { connect } from 'react-redux';
import Loading from '../../baseUI/loading';
import LazyLoad, {forceCheck} from 'react-lazyload'
import { CategoryDataContext, CHANGE_ALPHA, CHANGE_CATEGORY } from './data'
import { renderRoutes } from 'react-router-config'

function Singers(props) {
  const { data, dispatch} =  useContext(CategoryDataContext)
  const {category, alpha} = data.toJS ();

  const { singerList, enterLoading, pullUpLoading, pullDownLoading, pageCount } = props;
  const { getHotSingerDispatch, updateDispatch, pullDownRefreshDispatch, pullUpRefreshDispatch } = props;

  let handleUpdateAlpha = (val) => {
    dispatch({type: CHANGE_ALPHA, data: val})
    // setAlpha(val)
    updateDispatch(category, val)
  }

  let handleUpdateCatetory = (val) => {
    dispatch ({type: CHANGE_CATEGORY, data: val});
    // setCategory(val)
    updateDispatch(val, alpha)
  }

  //请求热门歌手数据
  useEffect(() => {
    if (!singerList.size) {
      getHotSingerDispatch ();
    }
  }, [])

  const enterDetail = (id)=>{
    props.history.push(`/singers/${id}`)
  }

  //渲染歌手
  const renderSingerList = () => {
    const list = singerList ? singerList.toJS() : []
    return (
      <List>
        {
          list.map((item, index) => (
            <ListItem key={item.accountId + '' + index} onClick={()=>enterDetail(item.id)}>
              <div className="img_wrapper">
                <LazyLoad placeholder={<img width='100%' height='100%' src={require('./singer.png') }></img>}>
                  <img src={`${item.picUrl}?param=300x300`} width="100%" height="100%" alt="music" />
                </LazyLoad>
              </div>
              <span className="name">{item.name}</span>
            </ListItem>
          ))
        }
      </List>
    )
  }

  const handlePullUp = () => {
    pullUpRefreshDispatch(category, alpha, category === '', pageCount)
  }
  const handlePullDown = () => {
    pullDownRefreshDispatch(category, alpha);
  };

  return (
    <div>
      <NavContainer>
        <Horizen
          list={categoryTypes}
          title={"分类 (默认热门):"}
          handleClick={handleUpdateCatetory}
          oldVal={category}
        />
        <Horizen
          list={alphaTypes}
          title={"首字母:"}
          handleClick={handleUpdateAlpha}
          oldVal={alpha}
        />
      </NavContainer>
      <ListContainer>
        <Scroll
          pullUp={handlePullUp}
          pullDown={handlePullDown}
          pullUpLoading={pullUpLoading}
          pullDownLoading={pullDownLoading}
          onScroll={forceCheck}
        >
          {renderSingerList()}
        </Scroll>
        <Loading show={enterLoading}></Loading>
      </ListContainer>
      { renderRoutes (props.route.routes) }
    </div>
  )
}

const mapStateToProps = (state) => ({
  singerList: state.getIn(['singers', 'singerList']),
  enterLoading: state.getIn(['singers', 'enterLoading']),
  pullUpLoading: state.getIn(['singers', 'pullUpLoading']),
  pullDownLoading: state.getIn(['singers', 'pullDownLoading']),
  pageCount: state.getIn(['singers', 'pageCount'])
})

const mapDispatchToProps = (dispatch) => {
  return {
    getHotSingerDispatch() {
      dispatch(getHotSingerList())
    },
    updateDispatch(category, alpha) {
      dispatch(changePageCount(0))//由于改变了分类，所以pageCount清零
      dispatch(changeEnterLoading(true));//loading，现在实现控制逻辑，效果实现放到下一节，后面的loading同理
      dispatch(getSingerList(category, alpha));
    },
    // 滑到最底部刷新部分的处理
    pullUpRefreshDispatch(category, alpha, hot, count) {
      dispatch(changePullUpLoading(true));
      dispatch(changePageCount(count + 1));
      if (hot) {
        dispatch(refreshMoreHotSingerList());
      } else {
        dispatch(refreshMoreSingerList(category, alpha));
      }
    },
    //顶部下拉刷新
    pullDownRefreshDispatch(category, alpha) {
      dispatch(changePullDownLoading(true));
      dispatch(changePageCount(0));//属于重新获取数据
      if (category === '' && alpha === '') {
        dispatch(getHotSingerList());
      } else {
        dispatch(getSingerList(category, alpha));
      }
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Singers));