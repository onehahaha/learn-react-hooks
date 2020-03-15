import React, { useEffect } from 'react';
import Slider from '../../components/slider/index';
import { connect } from 'react-redux';
import * as actionTypes from './store/actionCreators'
import RecommendList from '../../components/list/index';
import { Content } from './style'
import Scroll from '../../baseUI/scroll/index'
import { forceCheck } from 'react-lazyload';
import Loading from '../../baseUI//loading/index'

function Recommend(props) {
  const { bannerList, recommendList, enterLoading } = props
  const { getBannerDataDispatch, getRecommendListDataDispatch} = props

  useEffect(()=>{
    if(!bannerList.size){
      getBannerDataDispatch ();
    }
    if(!recommendList.size){
      getRecommendListDataDispatch ();
    }
  },[])

  const bannerListJS = bannerList ? bannerList.toJS () : [];
  const recommendListJS = recommendList ? recommendList.toJS () :[];

  return (
    <Content>
      <Scroll onScroll={forceCheck}>
        <div>
          <Slider bannerList={bannerListJS} ></Slider>
          <RecommendList recommendList={recommendListJS}></RecommendList>
        </div>
      </Scroll>
      {enterLoading ? <Loading></Loading>: null}
    </Content>
  )
}

//映射Redux全局的state到组件的props
const mapStateToProps = (state) => ({
  // 不要在这里将数据 toJS
  // 不然每次 diff 比对 props 的时候都是不一样的引用，还是导致不必要的重渲染，属于滥用 immutable
  bannerList: state.getIn (['recommend', 'bannerList']),
  recommendList: state.getIn(['recommend', 'recommendList']),
  enterLoading: state.getIn(['recommend', 'enterLoading'])
})
// 映射 dispatch 到 props 上
const mapDispachToProps = (dispatch) => ({
  getBannerDataDispatch() {
    dispatch(actionTypes.getBannerList())
  },
  getRecommendListDataDispatch() {
    dispatch(actionTypes.getRecommendList());
  },
})

export default connect(mapStateToProps, mapDispachToProps)(React.memo(Recommend));