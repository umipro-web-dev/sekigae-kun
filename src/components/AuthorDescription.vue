<template>
    <footer class="light">
        <div class="src">
                <h>ソースコードは<a href="https://github.com/umipro-web-dev/sekigae-kun" target="_blank" rel="noopener noreferrer">こちら</a></h>
                <h class="last-updated-date">最終更新日時: {{ LastUpdatedDate }}</h>
        </div>
        <span class="author">
            <h>作者：umipro-web</h>
            <br>
            <a href="https://github.com/umipro-web-dev" target="_blank" rel="noopener noreferrer"><img src="/github.png"
                    alt="github" width="30"></a>
            <a href="https://zenn.dev/umipro_web" target="_blank" rel="noopener noreferrer"><img src="/zenn.png" alt="zenn"
                    width="30"></a>
        </span>
        
    </footer>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const LastUpdatedDate = ref("");

onMounted(async () => {
    const res = await fetch("lastUpdatedDate.txt");
    LastUpdatedDate.value = await res.text();
})

</script>

<style scoped lang="scss">
footer {
    display: flex;
    flex-wrap: wrap;
    padding-top: 1em;
    padding-bottom: 1em;
}

footer.light {
    background-color: rgb(167, 224, 249);
}

div {
    margin-left: 1em;
}

h {
    font-size: 14px;
}

$by-margin: 5px;

.src {
    margin-top: $by-margin;
    
    .last-updated-date {
        margin-top: $by-margin + 3px;
        display: block;
    }
}

.author {

    margin-left: calc(100% - 22em);


    a {
        text-align: center;
    }

    a>img {
        margin-top: 7px;
    }

    a {
        margin-left: 1em;
    }
}
</style>