'use strict';

(function () {
  function sqr(x) {
    return x * x;
  }

  function dist2(v, w) {
    return sqr(v.x - w.x) + sqr(v.y - w.y);
  }

  function distToSegmentSquared(p, v, w) {
    var l2 = dist2(v, w);

    if (l2 == 0) return dist2(p, v);

    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;

    if (t < 0) return dist2(p, v);
    if (t > 1) return dist2(p, w);

    return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
  }

  function distToSegment(p, v, w) {
    return Math.sqrt(distToSegmentSquared(p, v, w));
  }

  /**
   * 分段对象
   * @param  {} start 起点
   * @param  {} end   终点
   */
  function Segment(start, end) {
    this.start = start; //起点
    this.end = end; //终点
    this.pois = []; //存储该 segment 缓冲区的 poi

    /**
     * 添加 poi 并按该 poi 到 segment 起点的距离排序. 
     * @param  {} poi
     */
    this.append = function (poi) {
      this.pois.push(poi);

      //这里需要注意. 这里我们做了简化, 因为一般来说缓冲距离远小于分段的长度.!!! 
      //poi 到 start 连线的夹角小于 45 度时, poi 到 start 距离越长, 沿分段方向的距离也就越大
      this.pois.sort(function (a, b) {
        var distanceA = dist2(a, start);
        var distanceB = dist2(b, start);
        return distanceA - distanceB;
      });
    };
  }

  /**
   * linestring 格式转换为 segments
   * @param  {} linstring
   * @returns {Array} segments
   */
  function linstringToSegments(linstring) {
    var arys = linstring.replace(/^LINESTRING\(/, '').replace(/\)/).split(/,/);
    var segments = [];

    for (var i = 0, size = arys.length - 1; i < size; i++) {
      var cur = arys[i].split(/\s/);

      var start = {};
      start.x = parseFloat(cur[0]);
      start.y = parseFloat(cur[1]);

      var nxt = arys[i + 1].split(/\s/);

      var end = {};
      end.x = parseFloat(nxt[0]);
      end.y = parseFloat(nxt[1]);

      var segment = new Segment(start, end);

      segments.push(segment);
    }

    return segments;
  }

  /**
   * 根据给定的 linestring 和 buffer (缓冲距离) 排序 pois
   * @param  {string} linestring 格式: [linestring](https://msdn.microsoft.com/en-us/library/bb895372.aspx)
   * @param  {number} buffer 单位:米
   * @param  {object} pois {x: number, y: number}
   * @returns {object} {list: Array, news: Array} list 全部数据, news 新增的 clone 数据
   */
  var sorter = function sorter(linestring, buffer, pois) {
    var segments = linstringToSegments(linestring);

    for (var i = 0, size = segments.length; i < size; i++) {
      var segment = segments[i];

      for (var j = 0, len = pois.length; j < len; j++) {
        var poi = pois[j];
        //distance from poi to segment
        var distance = distToSegment(poi, segment.start, segment.end);

        //因为计算有误差,另外传入的 pois 都是确定在 linestring 的缓冲区内的
        //所以这要大致相等即可, 5 (米) 一个经验值, 需要适时调整
        //还需要注意, 因为这里的计算有误差, 当一个点同时处于两个 segment 缓冲处的边界附近(-5, 5)时
        //如何判断该 poi 属于哪个 segment 呢? 或者这并不重要?

        if (distance < buffer + 5) {
          segment.append(poi);
        }
      }
    }

    var list = [];
    var news = []; //存储 clone 的 features

    for (var _i = 0, _size = segments.length; _i < _size; _i++) {
      var _segment = segments[_i];

      for (var _j = 0, _size2 = _segment.pois.length; _j < _size2; _j++) {
        var _poi = _segment.pois[_j];

        if (list[list.length - 1] !== _poi) {
          //如果 list 存在 poi ，则添加 poi 的 clone
          if (list.indexOf(_poi) !== -1 && typeof _poi.clone === 'function') {
            var clonePoi = _poi.clone();
            list.push(clonePoi);
            news.push(clonePoi);
          } else {
            list.push(_poi);
          }
        }
      }
    }

    return {
      list: list, //全部的 features
      news: news //新增的 clone 出来的 features
    };
  };

  window.sortPoisInLinestringBufferByDirection = sorter;
})();