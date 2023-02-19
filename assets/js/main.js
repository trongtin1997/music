const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'F8-PLAYER';
const player = $('.player')
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    isMute: false,
    currentVolume: 0.0,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
          name: "Rồi Tới Luôn",
          singer: "Nal",
          path: "assets/music/RoiToiLuon.mp3",
          image: "assets/img/roitoiluon.jpg"
        },
        {
            name: "See Tình",
            singer: "Hoàng Thuỳ Linh",
            path: "assets/music/SeeTinh.mp3",
            image: "assets/img/seetinh.jpg"
        },
        {
            name: "Thương Nhau Tới Bến",
            singer: "Nal",
            path: "assets/music/ThuongNhauToiBen.mp3",
            image: "assets/img/thuongnhautoiben.jpg"
        },
        {
            name: "Em ơi lên phố",
            singer: "Minh Vương M4U",
            path: "assets/music/EmOiLenPho.mp3",
            image: "assets/img/emoilenpho.jpg"
        },
        {
            name: "Vì Lòng Còn Thương",
            singer: "Dương Hồng Loan",
            path: "assets/music/ViLongConThuong.mp3",
            image: "assets/img/vilongconthuong.jpg"
        },
        {
            name: "Một Ngày Anh Nhớ Đến Em",
            singer: "Huỳnh James, Pjnboys",
            path: "assets/music/MotNgayAnhNhoDenEm.mp3",
            image: "assets/img/motngayanhnhodenem.jpg"
        },
        {
            name: "Quả Phụ Tướng",
            singer: "Dung Hoàng Phạm",
            path: "assets/music/QuaPhuTuong.mp3",
            image: "assets/img/quaphutuong.jpg"
        },
        {
            name: "Vùng Lá Me Bay",
            singer: "Dương Hồng Loan",
            path: "assets/music/VungLaMeBay.mp3",
            image: "assets/img/vunglamebay.jpg"
        },
        {
            name: "Nô Lệ Tình Yêu",
            singer: "Hồ Việt Trung",
            path: "assets/music/NoLeTinhYeu.mp3",
            image: "assets/img/noletinhyeu.jpg"
        },
      ],
    setConfig: function(key, value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function(){
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = "${index}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        });
        playlist.innerHTML = htmls.join('');
    },
    defineProperties: function(){
        Object.defineProperty(this, 'currentSong',{
            get: function(){
                return this.songs[this.currentIndex];
            }
        });
    },
    handlEvents: function(){
        const _this = this;
        const cdWidth = cd.offsetWidth;
        // Xử lý cd quay và dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause();
        // Xử lý phóng to thu nhỏ CD
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }
        // Xử lý khi click play
        playBtn.onclick = function(){
            if(_this.isPlaying){
                audio.pause();
                playBtn.classList.remove('playe')
            } else{
                audio.play();
                playBtn.classList.add('playe')
            }
        }
        // Khi song được play
        audio.onplay = function(){
            _this.isPlaying = true;
            player.classList.add('laying');
            cdThumbAnimate.play();
        }
        // Khi song bị pause
          audio.onpause = function(){
            _this.isPlaying = false;
            player.classList.remove('laying');
            cdThumbAnimate.pause();
        }
        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent;
            }
        }
        // Xử lý khi tua song
        progress.oninput = function(e){
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }
        // Khi next song
        nextBtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong();
            } else{
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
            _this.activeSong();
        }
        // Khi prev song
         prevBtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong();
            } else{
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
            _this.activeSong();
        }
        // Khi random song
        randomBtn.onclick = function(e){
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }
        //Xử lý lặp lại 1 song
        repeatBtn.onclick = function(e){
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }
        // Xử lý next song khi audio ended
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play();
            } else{
                nextBtn.click();
            }   
        }
        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e){
            // Xử lý khi click vào song
            const songNode = e.target.closest('.song:not(.active)');
            if(songNode && !e.target.closest('.option')){
                _this.currentIndex = Number(songNode.dataset.index);
                _this.loadCurrentSong();
                audio.play();
                _this.render();
                _this.activeSong();
            }
        }
    },
    scrollToActiveSong: function(){
        var view='';
        if(this.currentIndex<2) view='end';
        else view='nearest';
        setTimeout(() => {
            $('.song.active').scrollIntoView({
              behavior: "smooth",
              block: view
            });
          }, 300);
    },
    loadCurrentSong: function(){
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
        this.currentIndex = this.config.currentIndex;
    },
    nextSong: function(){
        this.currentIndex ++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function(){
        this.currentIndex --;
        if(this.currentIndex < 0){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function(){
        let newIndex;
        do{
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while(newIndex == this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
        this.activeSong();
    },
    activeSong: function () {
		const songs = $$('.song');
		songs.forEach((song, index) => {
			if (index === this.currentIndex) {
				song.classList.add('active');
				this.setConfig('currentIndex', this.currentIndex);
                this.scrollToActiveSong();
			} else song.classList.remove('active');
		});
	},
    start: function(){
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();
        //Định nghĩa các thuộc tính cho object
        this.defineProperties();
        //Lắng nghe xử lý sự kiện
        this.handlEvents();
        //Tải bài hát đầu tiên khi ứng dụng khởi chạy
        this.loadCurrentSong();
        //Render playlist
        this.render();
        // Hiển thị trạng thái ban đầu của button repeat và random
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
}
app.start();