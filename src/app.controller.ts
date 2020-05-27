import { Body, Controller, Get, Headers, Param, Post, Query, Render, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { chromium } from 'playwright';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService
  ) {
    //
  }

  @Get()
  public index(@Res() res: Response) {
    return res.render(
      this.appService.getViewName(),
      {
        message: 'Tweetshot'
      }
    );
  }

  @Get(':username/status/:id')
  public async getScreenshot(
    @Param() params: any,
    @Query() query: any
  ) {
    const tweetUrl = `https://twitter.com/${params.username}/status/${params.id}`;
    const data: object = {
      tweetUrl: tweetUrl,
      theme: query.theme || 'light',
      lang: query.lang || 'en'
    };
    console.log(data);
    return await this.takeScreenshot(data);
  }

  @Post('screenshot')
  public async takeScreenshot(
    @Body() body: any
  ) {
      // console.log({
      //   data: body,
      //   path: join(__dirname, '..', '/public/shots')
      // });

      const { tweetUrl, theme, lang } = body;
      let response = {};

      if (! tweetUrl) {
        return {
          error: true,
          message: 'URL is required!'
        }
      }

      const isValidUrl = tweetUrl.match(/^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)$/);
      if (! isValidUrl) {
        return {
          error: true,
          message: 'Tweet URL is invalid. You should use a Tweet status URL.'
        }
      }

      // Params
      const browser = await chromium.launch();
      const page = await browser.newPage();

      let screenshotURL = 'https://publish.twitter.com/';
      screenshotURL += '?query=' + encodeURIComponent(tweetUrl);
      screenshotURL += '&theme=' + theme;
      screenshotURL += '&lang=' + lang;
      screenshotURL += '&widget=Tweet';

      await page.goto(screenshotURL).catch(error => console.log('page:', error));

      console.log('Loading tweet...');
      await page.waitForTimeout(2000);

      const tweet = await page.$('.twitter-tweet');
      if (tweet) {
        console.log('Creating screenshot');
        const date = (new Date()).getTime();
        const filename = `tweetshot-${date}-${theme}-${lang}.png`;
        await tweet.screenshot({
          path: join(__dirname, '..', '/public/shots', filename),
          omitBackground: true
        });

        console.log('Screenshot created!');

        response = {
          success: true,
          message: 'Screenshot created!',
          filename: filename,
          fileUrl: `http://localhost:3000/shots/${filename}`
        };

      } else {
        console.log('Screenshot failed!');

        response = {
          error: true,
          message: 'Screenshot failed!'
        }

      }

      await browser.close();

      return response;
  }
}
