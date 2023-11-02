<!--
   __  __       _         ____                       
  |  \/  | __ _| | _____ / ___|_ __ ___  _   _ _ __  
  | |\/| |/ _` | |/ / _ \ |  _| '__/ _ \| | | | '_ \ 
  | |  | | (_| |   <  __/ |_| | | | (_) | |_| | |_) |
  |_|  |_|\__,_|_|\_\___|\____|_|  \___/ \__,_| .__/ 
                                              |_| 
  
  This AA was created by figlet.
  
-->

<template>
  <div class="container">
    <h2 class="title mb-4 main">グループ分け</h2>
    <p class="text mb-5">公正なグループ分けに。</p>
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
      <div class="grade-one">
        <h4 class="mb-2">男子</h4>
        <input type="text" class="first" v-model="firstGradeInput" @keydown.enter="addMember(1)" />
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
            <tr v-for="(i, index) in firstGradeMembers" :key="index">
              <td>{{ index + 1 }}</td>
              <td :class="i.status ? '' : 'disable'">{{ i.value }}</td>
              <td><input type="checkbox" :checked="i.isLeader" @input="toggleIsLeader($event, 1, index)"/></td>
              <td><input type="checkbox" :checked="i.status" @input="toggleStatus($event, 1, index)" /></td>
              <td><button class="btn" @click="popMember(1, index)">×</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="grade-two">
        <h4 class="mb-2">女子</h4>
        <input type="text" class="second" v-model="secondGradeInput" @keydown.enter="addMember(2)" />
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
            <tr v-for="(i, index) in secondGradeMembers" :key="index">
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
    <p class="title mb-5">グループ分けを実行する</p>
    <div class="makeGroup mb-5">

      <div class="makeGroupByGroupNum">
        <p>グループ数で分ける</p>
        <input type="number" v-model="GroupNum" @keydown.enter="makeGroupByGroup" />
        <button class="btn btn-primary" @click="makeGroupByGroup">実行</button>
        <table class="group">
          <tbody>
            <tr v-for="(i, index) in GroupByGroup" :key="index">
              <td>({{ index + 1 }})</td>
              <div class="members">
                <td v-for="(i2, index2) in i" :key="index2">{{ i2 }}</td>
              </div>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="makeGroupByMemberNum">
        <p>人数で分ける</p>
        <input type="number" v-model="memberNum" @keydown.enter="makeGroupByMember" />
        <button class="btn btn-primary" @click="makeGroupByMember">実行</button>
        <table class="member">
          <tbody>
            <tr v-for="(i, index) in GroupByMember" :key="index">
              <td>({{ index + 1 }})</td>
              <div class="members">
                <td v-for="(i2, index2) in i" :key="index2">{{ i2 }}</td>
              </div>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <AuthorDescription />
</template>



<script lang="ts" setup>
import { ref, watch, watchEffect, onMounted, computed } from "vue";
import { sleep } from "sleep-ts";
import { useCookies } from "vue3-cookies";
import { Base64 } from "js-base64";
import memberTypeToArray from "@/utils/memberTypeToArray";
import pickUpLeaders from "@/utils/pickUpLeaders"
import shuffleArray from "@/utils/shuffleArray";
import AuthorDescription from "@/components/AuthorDescription.vue";
//@ts-ignore
import Chance from "chance";

const chance = new Chance();

const { cookies } = useCookies();

interface memberType {
  value: string,
  status: boolean,
  isLeader: boolean
}

const isProd = computed(() => {
  const host = window.location.hostname;
  const prodReg = /^.+\.vercel\.app$/;
  return prodReg.test(host);
});

type gradeType = 1 | 2;

const firstGradeMembers = ref<memberType[]>([]);
const secondGradeMembers = ref<memberType[]>([]);

const firstGradeInput = ref("");
const secondGradeInput = ref("");

const GroupNum = ref<number>(0);
const memberNum = ref<number>(0);

const GroupByMember = ref<string[][]>();
const GroupByGroup = ref<string[][]>();

watchEffect(() => {
  const firstGradeArr = firstGradeMembers.value;
  const secondGradeArr = secondGradeMembers.value;

  if (firstGradeArr.length == 0 && secondGradeArr.length == 0) return;

  const membersArr = [[...firstGradeArr], [...secondGradeArr]];

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

  firstGradeMembers.value = membersArr[0];

  secondGradeMembers.value = membersArr[1];


});


const addMember = (grade: gradeType) => {
  switch (grade) {
    case 1:
      if (!firstGradeInput.value) break;
      firstGradeMembers.value.push({
        value: firstGradeInput.value,
        status: true,
        isLeader: false
      });
      firstGradeInput.value = "";
      break;
    case 2:
      if (!secondGradeInput.value) break;
      secondGradeMembers.value.push({
        value: secondGradeInput.value,
        status: true,
        isLeader: false
      });
      secondGradeInput.value = "";
      break;
    default:
      return; 
  }
}


const toggleStatus = (event: Event, grade: gradeType, index: number) => {
  switch (grade) {
    case 1:
      firstGradeMembers.value[index].status = (event.target as HTMLInputElement).checked;
      break;
    case 2:
      secondGradeMembers.value[index].status = (event.target as HTMLInputElement).checked;
      break;
    default:
      break;
  }
}

const toggleIsLeader = (event: Event, grade: gradeType, index: number) => {
  switch (grade) {
    case 1:
      firstGradeMembers.value[index].isLeader = (event.target as HTMLInputElement).checked;
      break;
    case 2:
      secondGradeMembers.value[index].isLeader = (event.target as HTMLInputElement).checked;
      break;
    default:
      break;
  }
}

const popMember = (grade: gradeType, index: number) => {
  switch (grade) {
    case 1:
      firstGradeMembers.value.splice(index, 1);
      break;
    case 2:
      secondGradeMembers.value.splice(index, 1);
      break;
    default:
      break;
  }
}


const makeGroupByGroup = async () => {
  //指定グループ数が0だった場合リターン
  if (GroupNum.value < 1) return;

  //作成されたグループを入れるための二次元配列
  const groups: string[][] = []

  for (let i = 0; i < GroupNum.value; i++) groups.push([]);


  const firstGrade = shuffleArray<string>(memberTypeToArray(firstGradeMembers.value));
  const secondGrade = shuffleArray<string>(memberTypeToArray(secondGradeMembers.value));

  //watchを使うためにref
  let groupIndex = ref(0);

  //参照するグループのインデックスが範囲外になったら元に戻す。
  const unWatch = watch(groupIndex, newVal => {
    if (newVal == GroupNum.value) groupIndex.value = 0;
  });


  for (let i = 0; i < firstGrade.length; i++) {
    await sleep(10);
    groups[groupIndex.value].push(firstGrade[i]);
    groupIndex.value++;
  }

  for (let i = 0; i < secondGrade.length; i++) {
    await sleep(10);
    groups[groupIndex.value].push(secondGrade[i]);
    groupIndex.value++;
  }

  unWatch();

  GroupByGroup.value = [...groups];
}


const makeGroupByMember = async () => {

  if (memberNum.value < 1) return;



  //作成されたグループを入れるための二次元配列
  const groups: string[][] = [];

  const leaders = pickUpLeaders(firstGradeMembers.value, secondGradeMembers.value)

  const firstGrade = shuffleArray<string>(memberTypeToArray(firstGradeMembers.value));
  const secondGrade = shuffleArray<string>(memberTypeToArray(secondGradeMembers.value));
  //全体のメンバー数。
  const allMembersNumber = firstGrade.length + secondGrade.length;
  //余ったメンバー分のグループも用意するためにceil。
  const calcatedGroupNum = Math.ceil(allMembersNumber / memberNum.value);

  if (allMembersNumber === 0) return;

  for (let i = 0; i < calcatedGroupNum; i++) groups.push([]);

  let groupIndex = ref(0);

  const unWatch = watch(groupIndex, newVal => {
    if (newVal == calcatedGroupNum) groupIndex.value = 0;
  });


  for (let i = 0; i < firstGrade.length; i++) {
    await sleep(10);
    groups[groupIndex.value].push(firstGrade[i]);
    groupIndex.value++;
  }

  for (let i = 0; i < secondGrade.length; i++) {
    await sleep(10);
    groups[groupIndex.value].push(secondGrade[i]);
    groupIndex.value++;
  }


  unWatch();

  

  GroupByMember.value = [...groups];
  

};

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
      firstGradeMembers.value = jsonObj.firstGrade;
      secondGradeMembers.value = jsonObj.secondGrade;

    } catch (e) {

      alert("ファイルが不正です。");

    }

  }



}

const downloadMembersData = (event: Event) => {
  const members = {
    firstGrade: [...firstGradeMembers.value],
    secondGrade: [...secondGradeMembers.value]
  }

  const formattedMembers = JSON.stringify(members, null, "\t");
  
  const fileData = new Blob([formattedMembers], { type: "application/json" });

  (event.target as HTMLAnchorElement).href = window.URL.createObjectURL(fileData);

}

const enableAllMembers = () => {

  firstGradeMembers.value = firstGradeMembers.value.map(({ value, isLeader }) => {
    return {
      value,
      isLeader,
      status: true
    }
  });

  secondGradeMembers.value = secondGradeMembers.value.map(({ value, isLeader }) => {
    return {
      value,
      isLeader,
      status: true
    }
  });


}

const disableAllMembers = () => {

  firstGradeMembers.value = firstGradeMembers.value.map(({ value, isLeader }) => {
    return {
      value,
      isLeader,
      status: false
    }
  });

  secondGradeMembers.value = secondGradeMembers.value.map(({ value, isLeader }) => {
    return {
      value,
      isLeader,
      status: false
    }
  });
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
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    height: fit-content;
    min-height: 60vh;

    div {
      width: 50%;

      table {
        margin: 0 auto;
        margin-top: 2em;
        border: solid 2px black;
        width: 80%;

        * {
          font-size: 1em;
        }

        tr {
          border: solid 1px black;

          div.members {

            display: flex;
            flex-wrap: wrap;
            width: 100%;

            td {
              border: solid 0.5px #c3c3c3;
              border-left: none;
              padding: 0 0.5em;
            }

          }

          td:nth-child(1) {
            border: solid 1px black;
          }

        }
      }
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

  a {
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
</style>
