/**
 * Audio Engine - Web Audio API 管理
 * 负责音乐加载、播放控制、时间同步
 */
class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.audioBuffer = null;
    this.source = null;
    this.isPlaying = false;
    this.startTime = 0;
    this.pausedTime = 0;
    this.listeners = [];
  }

  /**
   * 初始化音频上下文
   */
  init() {
    if (!this.audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    }
  }

  /**
   * 加载音频文件
   * @param {string} url - 音频文件 URL
   */
  async loadAudio(url) {
    this.init();
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      console.log('✓ 音频加载成功，时长:', this.audioBuffer.duration + 's');
      this.notifyListeners('audioLoaded', { duration: this.audioBuffer.duration });
    } catch (error) {
      console.error('✗ 音频加载失败:', error);
      this.notifyListeners('audioError', { error });
    }
  }

  /**
   * 播放音频
   */
  play() {
    if (!this.audioBuffer || this.isPlaying) return;
    
    this.init();
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.audioBuffer;
    this.source.connect(this.audioContext.destination);
    
    this.startTime = this.audioContext.currentTime - this.pausedTime;
    this.source.start(0, this.pausedTime);
    this.isPlaying = true;
    
    this.notifyListeners('play', { timestamp: this.audioContext.currentTime });
  }

  /**
   * 暂停音频
   */
  pause() {
    if (!this.isPlaying) return;
    
    this.source.stop();
    this.pausedTime = this.audioContext.currentTime - this.startTime;
    this.isPlaying = false;
    
    this.notifyListeners('pause', { currentTime: this.pausedTime });
  }

  /**
   * 停止音频并重置
   */
  stop() {
    if (this.source && this.isPlaying) {
      this.source.stop();
    }
    this.isPlaying = false;
    this.pausedTime = 0;
    
    this.notifyListeners('stop', { currentTime: 0 });
  }

  /**
   * 获取当前播放时间（秒）
   */
  getCurrentTime() {
    if (!this.isPlaying) return this.pausedTime;
    return this.audioContext.currentTime - this.startTime;
  }

  /**
   * 跳转到指定时间
   * @param {number} time - 时间（秒）
   */
  seek(time) {
    this.pausedTime = Math.max(0, Math.min(time, this.audioBuffer.duration));
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
    this.notifyListeners('seek', { currentTime: this.pausedTime });
  }

  /**
   * 注册监听器
   */
  on(event, callback) {
    this.listeners.push({ event, callback });
  }

  /**
   * 移除监听器
   */
  off(event, callback) {
    this.listeners = this.listeners.filter(l => !(l.event === event && l.callback === callback));
  }

  /**
   * 通知所有监听器
   */
  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      if (listener.event === event) {
        listener.callback(data);
      }
    });
  }
}

export default AudioEngine;
