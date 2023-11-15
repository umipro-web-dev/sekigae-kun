<!--
          _    _                        _                
 ___  ___| | _(_) __ _  __ _  ___      | | ___   _ _ __  
/ __|/ _ \ |/ / |/ _` |/ _` |/ _ \_____| |/ / | | | '_ \ 
\__ \  __/   <| | (_| | (_| |  __/_____|   <| |_| | | | |
|___/\___|_|\_\_|\__, |\__,_|\___|     |_|\_\\__,_|_| |_|
                 |___/                                   
  
  This AA was created by figlet.
  
-->

<template>
  <div class="container">
    <h2 class="title mb-4 main">席替えくん</h2>
    <p class="text mb-5">席替えを素早くしたいときに。</p>
    <h class="title">メンバーを追加</h>
    <div class="menu mt-5">
      <label for="import" class="importLabel">
        データを読み込む
        <input type="file" class="import" accept="application/json" @change="importMembersData($event)" id="import">
      </label>
      <a href="#" class="export" download="member_data.json" @click="downloadMembersData($event)">データをダウンロードする</a>
      <button class="btn btn-primary enable-all-members" @click="enableAllMembers">
        全生徒を有効化
      </button>
      <button class="btn btn-primary disable-all-members" @click="disableAllMembers">
        全生徒を無効化
      </button>
    </div>
    <div class="add-member mt-5">
      <div class="gender-one">
        <h4 class="mb-2">男子</h4>
        <input type="text" class="first" v-model="maleInput" @keydown.enter="addMember(1)" />
        <button class="firstRegister btn btn-primary" @click="addMember(1)">追加</button>
        <br>
        <table>
          <thead>
            <tr>
              <th>id</th>
              <th>氏名</th>
              <th>班長</th>
              <th>有効化</th>
              <th>削除する</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(i, index) in maleMembers" :key="index">
              <td>{{ index + 1 }}</td>
              <td :class="i.status ? '' : 'disable'">{{ i.value }}</td>
              <td><input type="checkbox" :checked="i.isLeader" @input="toggleIsLeader($event, 1, index)"/></td>
              <td><input type="checkbox" :checked="i.status" @input="toggleStatus($event, 1, index)" /></td>
              <td><button class="btn" @click="popMember(1, index)">×</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="gender-two">
        <h4 class="mb-2">女子</h4>
        <input type="text" class="second" v-model="femaleInput" @keydown.enter="addMember(2)" />
        <button class="secondRegister btn btn-primary" @click="addMember(2)">追加</button>
        <table>
          <thead>
            <tr>
              <th>id</th>
              <th>氏名</th>
              <th>班長</th>
              <th>有効化</th>
              <th>削除する</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(i, index) in femaleMembers" :key="index">
              <td>{{ index + 1 }}</td>
              <td :class="i.status ? '' : 'disable'">{{ i.value }}</td>
              <td><input type="checkbox" :checked="i.isLeader" @input="toggleIsLeader($event, 2, index)"/></td>
              <td><input type="checkbox" :checked="i.status" @input="toggleStatus($event, 2, index)" /></td>
              <td><button class="btn" @click="popMember(2, index)">×</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <p class="title mb-5">席替えを実行する</p>
    <div class="makeGroupByGroupNum mb-5">
        <button class="btn btn-primary" @click="makeGroupByGroup">実行</button>
    </div>
    <div class="makeGroup mb-5" ref="seatDom">
      
      <!-- 36席の席を表示 -->
        
        <div v-for="n in GroupByGroup" class="group">
          <div v-for="i, index in n" class="seat" :class="[i ? (i.isLeader ? 'leader' : '') : '', i ? (i.gender === 1 ? 'male' : 'female'): '']">
            {{ i ? i.value : "" }}
            <span class="indexClass" v-if="isShownIndex">({{ index+1 }})</span>
          </div>
        </div>
        
      
    </div>
    <div class="seatMenu" v-if="isGroupCreated">
        <label><input type="checkbox" v-model="isShownIndex"/>　席の番号を表示する</label>
        <a class="btn btn-primary" href="#" download="img.png" @click="downloadSeatImage($event)">席の画像を取得する</a>

    </div>
    <p class="title mb-5">席の手動変更</p>
    <div class="manualChange">
      <div class="beforeSeat"><input type="number" v-model="prevGroup"/>班<input type="number" v-model="prevSeat"/>番</div>
      <span>→</span>
      <div class="afterSeat"><input type="number" v-model="afterGroup"/>班<input type="number" v-model="afterSeat"/>番</div>
      <button class="btn btn-primary" @click="manualModify">変更</button>
    </div>
  </div>
  <AuthorDescription />
</template>



<script lang="ts" setup>
import { ref, watch, watchEffect, onMounted, computed } from "vue";
import { sleep } from "sleep-ts";
import { useCookies } from "vue3-cookies";
import { Base64 } from "js-base64";
import html2canvas from "html2canvas"
import memberTypeToArray from "@/utils/memberTypeToArray";
import pickUpLeaders from "@/utils/pickUpLeaders";
import shuffleArray from "@/utils/shuffleArray";
import AuthorDescription from "@/components/AuthorDescription.vue";
import unProxied from "@/utils/unProxied";

const { cookies } = useCookies();

interface memberType {
  value: string,
  status: boolean,
  isLeader: boolean,
  gender: 1 | 2
}

const convertingListForGroupNum = [2, 5, 1, 4, 0, 3]

const isProd = computed(() => {
  const host = window.location.hostname;
  const prodReg = /^.+\.vercel\.app$/;
  return prodReg.test(host);
});

type genderType = 1 | 2;

const maleMembers = ref<memberType[]>([]);
const femaleMembers = ref<memberType[]>([]);

const maleInput = ref("");
const femaleInput = ref("");

const GroupNum = ref<number>(6);
const GroupByGroup = ref<(memberType | undefined)[][]>([[], [], [], [], [], []]);


const prevGroup = ref("")
const prevSeat = ref("")

const afterGroup = ref("")
const afterSeat = ref("")

const isShownIndex = ref<boolean>(false)

const seatDom = ref<HTMLElement>()

const isGroupCreated = ref(false)

const isJh = true

const emptyMember: memberType = {
  value: "",
  isLeader: false,
  status: true,
  gender: 1
}

watch(GroupByGroup, ()=>GroupByGroup.value.forEach((v, i1)=>{
    v.forEach((item, i2)=>{
      if (item === undefined) GroupByGroup.value[i1].splice(i2, 1, emptyMember)
    }) 
}))

watchEffect(() => {
  const maleArr = maleMembers.value;
  const femaleArr = femaleMembers.value;

  if (maleArr.length == 0 && femaleArr.length == 0) return;

  const membersArr = [[...maleArr], [...femaleArr]];

  const members = JSON.stringify(membersArr);

  const encodedMembers = Base64.encodeURI(members);

  const now = new Date();

  cookies.remove("members", "/");

  cookies.set("members", encodedMembers, new Date(now.getFullYear() + 10, 1, 19), "/", undefined, isProd.value, "strict");

});


onMounted(() => {

  const membersCookie = cookies.get("members");

  if (!membersCookie) return;

  const membersArr: memberType[][] = JSON.parse(Base64.decode(cookies.get("members")));

  maleMembers.value = membersArr[0];

  femaleMembers.value = membersArr[1];


});


const addMember = (gender: genderType) => {
    if (maleMembers.value.length + femaleMembers.value.length >= 36) return;

  switch (gender) {
    case 1:
      if (!maleInput.value) break;
      maleMembers.value.push({
        value: maleInput.value,
        status: true,
        isLeader: false,
        gender: 1
      });
      maleInput.value = "";
      break;
    case 2:
      if (!femaleInput.value) break;
      femaleMembers.value.push({
        value: femaleInput.value,
        status: true,
        isLeader: false,
        gender: 2
      });
      femaleInput.value = "";
      break;
    default:
      return; 
  }
}


const toggleStatus = (event: Event, gender: genderType, index: number) => {
  switch (gender) {
    case 1:
      maleMembers.value[index].status = (event.target as HTMLInputElement).checked;
      break;
    case 2:
      femaleMembers.value[index].status = (event.target as HTMLInputElement).checked;
      break;
    default:
      break;
  }
}

const toggleIsLeader = (event: Event, gender: genderType, index: number) => {
  switch (gender) {
    case 1:
      maleMembers.value[index].isLeader = (event.target as HTMLInputElement).checked;
      break;
    case 2:
      femaleMembers.value[index].isLeader = (event.target as HTMLInputElement).checked;
      break;
    default:
      break;
  }
}

const popMember = (gender: genderType, index: number) => {
  switch (gender) {
    case 1:
      maleMembers.value.splice(index, 1);
      break;
    case 2:
      femaleMembers.value.splice(index, 1);
      break;
    default:
      break;
  }
}


const makeGroupByGroup = async () => {
  //指定グループ数が0だった場合リターン
  if (GroupNum.value < 1) return;

  //作成されたグループを入れるための二次元配列
  const groups: memberType[][] = []

  for (let i = 0; i < GroupNum.value; i++) groups.push([]);


  const male = shuffleArray<memberType>(memberTypeToArray(maleMembers.value));
  const female = shuffleArray<memberType>(memberTypeToArray(femaleMembers.value));
  const leaders = shuffleArray(pickUpLeaders(maleMembers.value, femaleMembers.value));

  const maleLeaders: memberType[] = []
  const femaleLeaders: memberType[] = []

  leaders.forEach(v => {
    if (v.gender === 1) {
      maleLeaders.push(v)
    } else {
      femaleLeaders.push(v)
    }
  })

  //watchを使うためにref
  let groupIndex = ref(0);

  let maleCnt = 0

  let femaleCnt = 0

  let isMaleTime = true

  let useAbleMale = true

  let useAbleFemale = true

  let cnt = 0;

  //参照するグループのインデックスが範囲外になったら元に戻す。
  const unWatch = watch(groupIndex, newVal => {
    if (newVal == GroupNum.value)  {
      cnt++
      groupIndex.value = 0;
      if (cnt == 1 || cnt == 3)  isMaleTime = !isMaleTime
    }
  });

  

  while (useAbleMale || useAbleFemale) {
    await sleep(10)
    if (isMaleTime) {
      groups[groupIndex.value].push(male[maleCnt])
      maleCnt++;
    } else {
      groups[groupIndex.value].push(female[femaleCnt])
      femaleCnt++;
    }
    groupIndex.value++

    if (maleCnt === male.length) {
      isMaleTime = false
      useAbleMale = false
      unWatch()
    }

    if (femaleCnt === female.length) {
      isMaleTime = true
      useAbleFemale = false
      unWatch()
    }

  }

  let maleLeadersCnt = 0

  let femaleLeadersCnt = 0

  for (let i = 0; i < 6; i++) {
    if (groups[i].slice(-1)[0].gender === 1  && groups[i].length === 5) {
      groups[i].push(femaleLeaders[femaleLeadersCnt])
      femaleLeadersCnt++
    } else {
      groups[i].push(maleLeaders[maleLeadersCnt])
      maleLeadersCnt++
    }
  }

  const fixedGroups = groups.map((v, i) =>{
    if (i <= 2) return v
    return [
      v[1],
      v[0],
      v[3],
      v[2],
      v[5],
      v[4]    
    ]
  })

  if (isJh){

  const front1member = fixedGroups[0][0]

  const front2member = fixedGroups[0][1]

  fixedGroups[0][0] = fixedGroups[4][4]
  fixedGroups[0][1]  = fixedGroups[5][4]

  fixedGroups[4][4] = front1member
  fixedGroups[5][4] = front2member

  }



  GroupByGroup.value = [...fixedGroups];

  isGroupCreated.value = true
}


const isValidSeatValue = (value: number): boolean => value >= 0 && value <= 5 && Math.floor(value) === value

const manualModify = () => {
  if (!isGroupCreated.value) {
    alert("まだ席が作成されていません")
    return
  }

  const prevGroupNum = parseInt(prevGroup.value) - 1
  const prevSeatNum = parseInt(prevSeat.value) - 1
  const afterGroupNum = parseInt(afterGroup.value) - 1
  const afterSeatNum = parseInt(afterSeat.value) - 1 
  if (!(isValidSeatValue(prevGroupNum) && isValidSeatValue(prevSeatNum) && isValidSeatValue(afterGroupNum) && isValidSeatValue(afterSeatNum))) return
  const afterSeatInfo: memberType = structuredClone(unProxied(GroupByGroup.value[convertingListForGroupNum[afterGroupNum]][afterSeatNum])) as memberType

  GroupByGroup.value[convertingListForGroupNum[afterGroupNum]][afterSeatNum] = structuredClone(unProxied(GroupByGroup.value[convertingListForGroupNum[prevGroupNum]][prevSeatNum])) as memberType

  GroupByGroup.value[convertingListForGroupNum[prevGroupNum]][prevSeatNum] = structuredClone(afterSeatInfo)

  
}

const importMembersData = (event: Event) => {
  if ((event.target as HTMLInputElement).files === null) {
    alert("ファイルが選択されていません")
    return;
  }
  const jsonFile = (event.target as HTMLInputElement).files![0];

  if (jsonFile.type !== "application/json") {
    alert("ファイルの形式が不正です。");
    return;
  }

  const reader = new FileReader();

  reader.readAsText(jsonFile);

  reader.onload = () => {
    try {

      const jsonObj = JSON.parse(reader.result as string);
      maleMembers.value = jsonObj.male;
      femaleMembers.value = jsonObj.female;

    } catch (e) {

      alert("ファイルが不正です。");

    }

  }



}

const downloadMembersData = (event: Event) => {
  const members = {
    male: [...maleMembers.value],
    female: [...femaleMembers.value]
  }

  const formattedMembers = JSON.stringify(members, null, "\t");
  
  const fileData = new Blob([formattedMembers], { type: "application/json" });

  (event.target as HTMLAnchorElement).href = window.URL.createObjectURL(fileData);

}

const enableAllMembers = () => {

  maleMembers.value = maleMembers.value.map(({ value, isLeader, gender }) => {
    return {
      value,
      isLeader,
      gender,
      status: true
    }
  });

  femaleMembers.value = femaleMembers.value.map(({ value, isLeader, gender }) => {
    return {
      value,
      isLeader,
      gender,
      status: true
    }
  });


}

const disableAllMembers = () => {

  maleMembers.value = maleMembers.value.map(({ value, isLeader, gender }) => {
    return {
      value,
      isLeader,
      status: false,
      gender
    }
  });

  femaleMembers.value = femaleMembers.value.map(({ value, isLeader, gender }) => {
    return {
      value,
      isLeader,
      status: false,
      gender
    }
  });
}

const downloadSeatImage = (event: Event) =>{
  if (!isGroupCreated.value) return
  html2canvas(seatDom.value!).then(img =>{
    const dataUrl = img.toDataURL();

    (event.target as HTMLAnchorElement).href = dataUrl
  })
}

</script>

<style>
html,
body,
#app {
  width: 100%;
  height: fit-content;
}

* {
  font-family: Arial, Helvetica, sans-serif !important;
}
</style>

<style scoped lang="scss">

$bs-blue: var(--bs-primary);
$bs-btn-hover: var(--bs-btn-hover-bg);

div.container {
  margin: 0 auto;
  width: 80%;
  height: 100%;
  text-align: center;

  .title {
    font-size: 1.8em;
  }

  div.add-member {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    height: fit-content;
    min-height: 70vh;
    margin-bottom: 2em;

    button {
      width: 3.5em;
      height: 2.7em;
      font-size: 0.8em;
      padding: 0;
      border: none;

    }

    &>div {
      width: 40%;
      height: 100%;
    }

    table {
      border: solid 2px #767676;
      margin: 0 auto;
      margin-top: 3em;
      width: 95%;
      height: fit-content;

      thead {
        border-bottom: solid 2px #767676;
        height: 0.5em;
      }

      thead>tr>th {
        font-size: 0.7em;
        padding: 0.6em 0;
      }

      tbody {
        height: 2vw;

        tr {
          border-bottom: solid #949494 .99px;
        }

        td {
          font-size: 1.5vw;

        }

      }

      th,
      td {
        text-align: center;
      }

      * {
        font-size: 2vw;
      }
    }
  }

  div.makeGroup {

    width: 100%;
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 0.1em 0.1em;

    & > * {
      margin: 0 auto;
    }
    

    .group {
        height: 10%;
        width:calc(33% - 0.2em);
        display: flex;
        flex-wrap: wrap;
        padding-top: 0.5em;
    }

    .seat {
      margin-left: calc((50% - 5em) / 2);
      margin-right: calc((50% - 5em) / 2);
      margin-bottom: 0.5em;
      width: 5em;
      height: 3em;
      color: #fff;
      text-align: center;
      line-height: 40px;
      border-radius: 5px;
    }

    .male { 
      background-color: #0b5ed7;
    }

    .female {
      background-color: #f93ab6;
    }
    .leader {
      border: 3px solid #000000;
    }

    }

  }



.disable {
  color: #adadad;
  text-decoration: line-through #adadad 1.5px;
}

.center {
  text-align: center;
}

.title {
  border-bottom: solid 2px #c67070;
  width: fit-content;
  margin: 0 auto;
  font-size: 1.5em;
}

.main {
  padding: 0.5em 0;
}

.btn:hover {
  color: #767676;
}


div.menu {

  $transition-sec: 0.2s;

  display: flex;
  position: relative;
  width: 80%;
  margin: 0 auto;
  flex-wrap: wrap;
  justify-content: center;
  border: solid 1px #656565;
  border-radius: 10px;
  padding: 1em;
  box-sizing: content-box;


  &::before {
    content: "メニュー";
    display: inline;
    height: fit-content;
    background-color: #ffffff;
    padding: 0 0.5em;
    position: absolute;
    z-index: 100;
    left: 11px;
    bottom: 4.3vw;
  }

  a.export {
    text-decoration: none;
    color: #ffffff;
    background-color: $bs-blue;
    border-radius: 5px;
    padding: 3px 3px;

    &:hover {
      color: #848484;
      border-color: #0b5ed7;
      background-color: #0b5ed7;
      transition: $transition-sec;
    }

  }

  label {
    color: #ffffff;
    background-color: $bs-blue;
    cursor: pointer;
    border-radius: 5px;
    padding: 3px 3px;

    &:hover {
      color: #848484;
      border-color: #0b5ed7;
      background-color: #0b5ed7;
      transition: $transition-sec;
    }

  }

  label>input {
    display: none;
  }

  button {
    padding: 3px;
  }

  * {
    margin-right: 1em;
    font-size: 1.2vw;

    
  }

  &:nth-child(3n) {
    margin-right: 2em;
  }

}


div.manualChange {
  display: flex;
  flex-wrap: wrap;
  width: fit-content;
  margin: 0 auto;

  div {
    font-size: small;

    input {
      width:30%;
      font-size: inherit;
      line-height: inherit;
    }

  }

  button {
    margin-bottom: 1em;
  }
}

.indexClass {
  font-size: 0.7em;
  text-align: end;
}

.seatMenu {
  display: flex;
  justify-content: space-around;
  margin-top: 0.5em;
  margin-bottom: 1em;
  a {
    @extend .export;
    font-size: 0.8em;
  }
}
</style>
